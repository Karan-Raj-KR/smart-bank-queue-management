from datetime import datetime

from pydantic import BaseModel

from app.models.service_type import ServiceType
from app.models.token import TokenStatus


class CounterCreate(BaseModel):
    name: str
    service_types: list[str]
    branch_id: int


class CounterResponse(BaseModel):
    id: int
    name: str
    service_types: list[str]
    branch_id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenInfo(BaseModel):
    token_number: str
    service_type: ServiceType
    is_priority: bool
    status: TokenStatus

    model_config = {"from_attributes": True}


class CallNextRequest(BaseModel):
    counter_id: int


class CallNextResponse(BaseModel):
    counter_id: int
    current_token: TokenInfo | None
    next_token: TokenInfo | None


class QueueEntry(BaseModel):
    token_number: str
    service_type: str
    is_priority: bool
    position: int
    issued_at: datetime


class CounterServing(BaseModel):
    token_number: str
    service_type: str
    is_priority: bool
    counter_id: int


class QueueStatusResponse(BaseModel):
    branch_id: int
    waiting_queue: list[QueueEntry]
    counters: dict[int, CounterServing | None]
