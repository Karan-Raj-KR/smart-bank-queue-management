import logging
from datetime import date, datetime

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.service_type import ServiceType
from app.models.token import Token, TokenStatus
from app.schemas.token import TokenCreate, TokenResponse

logger = logging.getLogger(__name__)


async def _get_or_create_customer(db: AsyncSession, name: str, phone: str) -> Customer:
    result = await db.execute(select(Customer).where(Customer.phone == phone))
    customer = result.scalar_one_or_none()
    if customer is None:
        customer = Customer(name=name, phone=phone)
        db.add(customer)
        await db.flush()
    return customer


async def _next_token_number(
    db: AsyncSession, branch_id: int, service_type: ServiceType
) -> str:
    prefix = service_type.value[0].upper()
    today_start = datetime.combine(date.today(), datetime.min.time())

    result = await db.execute(
        select(func.count(Token.id)).where(
            Token.branch_id == branch_id,
            Token.service_type == service_type,
            Token.issued_at >= today_start,
        )
    )
    count = result.scalar_one()
    return f"{prefix}{count + 1:03d}"


async def _queue_position(
    db: AsyncSession, branch_id: int, service_type: ServiceType, token_id: int
) -> int:
    result = await db.execute(
        select(func.count(Token.id)).where(
            Token.branch_id == branch_id,
            Token.service_type == service_type,
            Token.status == TokenStatus.WAITING,
            Token.id <= token_id,
        )
    )
    return result.scalar_one()


async def generate_token(db: AsyncSession, data: TokenCreate) -> TokenResponse:
    try:
        customer = await _get_or_create_customer(db, data.customer_name, data.phone)
        token_number = await _next_token_number(db, data.branch_id, data.service_type)

        token = Token(
            token_number=token_number,
            branch_id=data.branch_id,
            customer_id=customer.id,
            service_type=data.service_type,
            is_priority=data.is_priority,
            status=TokenStatus.WAITING,
        )
        db.add(token)
        await db.flush()

        position = await _queue_position(db, data.branch_id, data.service_type, token.id)

        from app.services.prediction import predict_wait_time
        estimated_wait_minutes = predict_wait_time(position, data.service_type.value)

        return TokenResponse(
            token_number=token.token_number,
            position=position,
            estimated_wait_minutes=estimated_wait_minutes,
            status=token.status,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "generate_token failed for customer_name=%s phone=%s service_type=%s branch_id=%s",
            data.customer_name,
            data.phone,
            data.service_type,
            data.branch_id,
        )
        raise HTTPException(
            status_code=500,
            detail=f"Token generation failed: {type(exc).__name__}: {exc}",
        )
