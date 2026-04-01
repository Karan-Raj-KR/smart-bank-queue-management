import re

from pydantic import BaseModel, field_validator

from app.models.service_type import ServiceType
from app.models.token import TokenStatus


class TokenCreate(BaseModel):
    customer_name: str
    phone: str
    service_type: ServiceType
    is_priority: bool = False
    branch_id: int

    @field_validator("customer_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("Name must be 1-100 characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?\d{7,15}$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned

    @field_validator("branch_id")
    @classmethod
    def validate_branch_id(cls, v: int) -> int:
        if v < 1:
            raise ValueError("branch_id must be positive")
        return v


class TokenResponse(BaseModel):
    token_number: str
    service_type: str
    position: int
    estimated_wait_minutes: int
    status: TokenStatus
    qr_code: str

    model_config = {"from_attributes": True}
