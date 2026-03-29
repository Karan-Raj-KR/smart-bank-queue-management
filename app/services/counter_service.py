from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.counter import Counter
from app.models.service_type import ServiceType
from app.models.token import Token, TokenStatus
from app.schemas.counter import (
    CallNextResponse,
    QueueEntry,
    QueueStatusResponse,
    TokenInfo,
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

    return CallNextResponse(
        counter_id=counter_id,
        current_token=TokenInfo.model_validate(current_token) if current_token else None,
        next_token=TokenInfo.model_validate(next_token) if next_token else None,
    )


async def get_queue_status(branch_id: int, db: AsyncSession) -> QueueStatusResponse:
    result = await db.execute(
        select(Token)
        .where(
            Token.branch_id == branch_id,
            Token.status == TokenStatus.WAITING,
        )
        .order_by(Token.service_type, Token.is_priority.desc(), Token.issued_at.asc())
    )
    tokens = result.scalars().all()

    queue: dict[str, list[QueueEntry]] = {}
    position_counters: dict[str, int] = {}

    for token in tokens:
        stype = token.service_type.value
        if stype not in queue:
            queue[stype] = []
            position_counters[stype] = 0
        position_counters[stype] += 1
        queue[stype].append(
            QueueEntry(
                token_number=token.token_number,
                is_priority=token.is_priority,
                position=position_counters[stype],
                issued_at=token.issued_at,
            )
        )

    return QueueStatusResponse(branch_id=branch_id, queue=queue)
