from datetime import datetime

from pydantic import BaseModel


class CustomerCreate(BaseModel):
    name: str
    phone: str


class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}
