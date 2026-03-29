from pydantic import BaseModel

from app.models.service_type import ServiceType
from app.models.token import TokenStatus


class TokenCreate(BaseModel):
    customer_name: str
    phone: str
    service_type: ServiceType
    is_priority: bool = False
    branch_id: int


class TokenResponse(BaseModel):
    token_number: str
    position: int
    estimated_wait_minutes: int
    status: TokenStatus

    model_config = {"from_attributes": True}
