from datetime import datetime

from pydantic import BaseModel


class BranchCreate(BaseModel):
    name: str
    address: str | None = None


class BranchResponse(BaseModel):
    id: int
    name: str
    address: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
