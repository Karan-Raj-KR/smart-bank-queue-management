from datetime import datetime

from pydantic import BaseModel, field_validator


class BranchCreate(BaseModel):
    name: str
    address: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 255:
            raise ValueError("Branch name must be 1-255 characters")
        return v


class BranchResponse(BaseModel):
    id: int
    name: str
    address: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
