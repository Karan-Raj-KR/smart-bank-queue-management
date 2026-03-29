from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.counter import CallNextRequest, CallNextResponse, QueueStatusResponse
from app.services.counter_service import call_next_token, get_queue_status

router = APIRouter(prefix="/counters", tags=["counters"])


@router.post("/call-next", response_model=CallNextResponse)
async def call_next_endpoint(
    payload: CallNextRequest, db: AsyncSession = Depends(get_db)
) -> CallNextResponse:
    return await call_next_token(payload.counter_id, db)


@router.get("/queue/{branch_id}", response_model=QueueStatusResponse)
async def queue_status_endpoint(
    branch_id: int, db: AsyncSession = Depends(get_db)
) -> QueueStatusResponse:
    return await get_queue_status(branch_id, db)
