from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.counter import Counter
from app.models.service_type import ServiceType
from app.models.token import Token, TokenStatus
from app.schemas.counter import (
    CallNextResponse,
    CounterServing,
    QueueEntry,
    QueueStatusResponse,
    TokenInfo,
)
from app.tasks.notifications import send_sms_task


def _send_sms_notification(to_phone: str, token_number: str) -> None:
    """Dispatch an SMS notification as a Celery background task."""
    send_sms_task.delay(
        to_phone,
        f"Your token {token_number} will be called soon. Please proceed to the bank.",
    )


async def call_next_token(counter_id: int, db: AsyncSession) -> CallNextResponse:
    result = await db.execute(select(Counter).where(Counter.id == counter_id))
    counter = result.scalar_one_or_none()
    if counter is None:
        raise HTTPException(status_code=404, detail="Counter not found")

    # Complete the currently called token for this counter, if any
    result = await db.execute(
        select(Token).where(
            Token.counter_id == counter_id,
            Token.status == TokenStatus.CALLED,
        )
    )
    current_token = result.scalar_one_or_none()
    if current_token:
        current_token.status = TokenStatus.COMPLETED
        current_token.completed_at = datetime.now(timezone.utc)

    # Find the next waiting token: priority first, then by issued_at
    service_types = [ServiceType(st) for st in counter.service_types]
    result = await db.execute(
        select(Token)
        .where(
            Token.branch_id == counter.branch_id,
            Token.service_type.in_(service_types),
            Token.status == TokenStatus.WAITING,
        )
        .order_by(Token.is_priority.desc(), Token.issued_at.asc())
        .limit(1)
    )
    next_token = result.scalar_one_or_none()
    if next_token:
        next_token.status = TokenStatus.CALLED
        next_token.called_at = datetime.now(timezone.utc)
        next_token.counter_id = counter_id

    response = CallNextResponse(
        counter_id=counter_id,
        current_token=TokenInfo.model_validate(current_token) if current_token else None,
        next_token=TokenInfo.model_validate(next_token) if next_token else None,
    )

    if next_token:
        from app.routers.websocket import manager

        await manager.broadcast_to_branch(
            counter.branch_id,
            {
                "event": "token_called",
                "token_number": next_token.token_number,
                "counter_id": counter_id,
            },
        )

        # Notify the customer 3 positions ahead in the queue
        result = await db.execute(
            select(Token)
            .where(
                Token.branch_id == counter.branch_id,
                Token.service_type == next_token.service_type,
                Token.status == TokenStatus.WAITING,
                Token.id != next_token.id,
            )
            .order_by(Token.is_priority.desc(), Token.issued_at.asc())
            .offset(2)
            .limit(1)
            .options(joinedload(Token.customer))
        )
        upcoming_token = result.scalar_one_or_none()
        if upcoming_token and upcoming_token.customer.phone:
            _send_sms_notification(upcoming_token.customer.phone, upcoming_token.token_number)

    return response


async def get_queue_status(branch_id: int, db: AsyncSession) -> QueueStatusResponse:
    # Waiting tokens ordered by priority then time
    result = await db.execute(
        select(Token)
        .where(
            Token.branch_id == branch_id,
            Token.status == TokenStatus.WAITING,
        )
        .order_by(Token.is_priority.desc(), Token.issued_at.asc())
    )
    tokens = result.scalars().all()

    waiting_queue = []
    for i, token in enumerate(tokens):
        waiting_queue.append(
            QueueEntry(
                token_number=token.token_number,
                service_type=token.service_type.value,
                is_priority=token.is_priority,
                position=i + 1,
                issued_at=token.issued_at,
            )
        )

    # Currently serving at each counter
    counter_result = await db.execute(
        select(Counter).where(Counter.branch_id == branch_id, Counter.is_active == True)
    )
    counters_list = counter_result.scalars().all()

    counters: dict[int, CounterServing | None] = {}
    for counter in counters_list:
        token_result = await db.execute(
            select(Token).where(
                Token.counter_id == counter.id,
                Token.status == TokenStatus.CALLED,
            )
        )
        serving_token = token_result.scalar_one_or_none()
        if serving_token:
            counters[counter.id] = CounterServing(
                token_number=serving_token.token_number,
                service_type=serving_token.service_type.value,
                is_priority=serving_token.is_priority,
                counter_id=counter.id,
            )
        else:
            counters[counter.id] = None

    return QueueStatusResponse(
        branch_id=branch_id,
        waiting_queue=waiting_queue,
        counters=counters,
    )
