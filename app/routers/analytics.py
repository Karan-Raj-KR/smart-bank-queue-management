from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.token import Token, TokenStatus
from app.schemas.analytics import (
    HourlyEntry,
    HourlyResponse,
    ServiceBreakdownEntry,
    ServiceBreakdownResponse,
    SummaryResponse,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _today_start() -> datetime:
    return datetime.combine(date.today(), datetime.min.time())


@router.get("/{branch_id}/summary", response_model=SummaryResponse)
async def get_summary(branch_id: int, db: AsyncSession = Depends(get_db)):
    today = _today_start()

    total_result = await db.execute(
        select(func.count(Token.id)).where(
            Token.branch_id == branch_id,
            Token.issued_at >= today,
        )
    )
    total_tokens = total_result.scalar_one()

    wait_result = await db.execute(
        select(
            func.avg(
                func.extract("epoch", Token.completed_at - Token.issued_at) / 60.0
            )
        ).where(
            Token.branch_id == branch_id,
            Token.issued_at >= today,
            Token.completed_at.isnot(None),
        )
    )
    avg_wait = wait_result.scalar_one() or 0.0

    busiest_result = await db.execute(
        select(
            func.extract("hour", Token.issued_at).label("hour"),
            func.count(Token.id).label("cnt"),
        )
        .where(
            Token.branch_id == branch_id,
            Token.issued_at >= today,
        )
        .group_by("hour")
        .order_by(func.count(Token.id).desc())
        .limit(1)
    )
    busiest_row = busiest_result.first()
    busiest_hour = int(busiest_row.hour) if busiest_row else None

    no_show_result = await db.execute(
        select(func.count(Token.id)).where(
            Token.branch_id == branch_id,
            Token.issued_at >= today,
            Token.status == TokenStatus.NO_SHOW,
        )
    )
    no_show_count = no_show_result.scalar_one()

    return SummaryResponse(
        branch_id=branch_id,
        total_tokens_today=total_tokens,
        average_wait_time_today=round(float(avg_wait), 2),
        busiest_hour_today=busiest_hour,
        no_show_count_today=no_show_count,
    )


@router.get("/{branch_id}/hourly", response_model=HourlyResponse)
async def get_hourly(branch_id: int, db: AsyncSession = Depends(get_db)):
    today = _today_start()

    result = await db.execute(
        select(
            func.extract("hour", Token.issued_at).label("hour"),
            func.count(Token.id).label("token_count"),
            func.avg(
                func.extract("epoch", Token.completed_at - Token.issued_at) / 60.0
            ).label("avg_wait"),
        )
        .where(
            Token.branch_id == branch_id,
            Token.issued_at >= today,
        )
        .group_by("hour")
        .order_by("hour")
    )
    rows = result.all()

    data = [
        HourlyEntry(
            hour=int(row.hour),
            token_count=row.token_count,
            average_wait_minutes=round(float(row.avg_wait or 0.0), 2),
        )
        for row in rows
    ]
    return HourlyResponse(branch_id=branch_id, data=data)


@router.get("/{branch_id}/service-breakdown", response_model=ServiceBreakdownResponse)
async def get_service_breakdown(branch_id: int, db: AsyncSession = Depends(get_db)):
    today = _today_start()

    result = await db.execute(
        select(
            Token.service_type.label("service_type"),
            func.count(Token.id).label("token_count"),
            func.avg(
                func.extract("epoch", Token.completed_at - Token.issued_at) / 60.0
            ).label("avg_wait"),
        )
        .where(
            Token.branch_id == branch_id,
            Token.issued_at >= today,
        )
        .group_by(Token.service_type)
        .order_by(Token.service_type)
    )
    rows = result.all()

    data = [
        ServiceBreakdownEntry(
            service_type=row.service_type.value,
            token_count=row.token_count,
            average_wait_minutes=round(float(row.avg_wait or 0.0), 2),
        )
        for row in rows
    ]
    return ServiceBreakdownResponse(branch_id=branch_id, data=data)
