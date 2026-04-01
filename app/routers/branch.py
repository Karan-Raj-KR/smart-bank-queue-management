from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.branch import Branch
from app.models.counter import Counter
from app.schemas.branch import BranchCreate, BranchResponse

router = APIRouter(prefix="/branches", tags=["branches"])


@router.post("", response_model=BranchResponse, status_code=201)
async def create_branch(
    payload: BranchCreate, db: AsyncSession = Depends(get_db)
) -> BranchResponse:
    branch = Branch(name=payload.name, address=payload.address)
    db.add(branch)
    await db.flush()
    return BranchResponse.model_validate(branch)


@router.get("", response_model=list[BranchResponse])
async def list_branches(db: AsyncSession = Depends(get_db)) -> list[BranchResponse]:
    result = await db.execute(select(Branch).order_by(Branch.id))
    branches = result.scalars().all()
    return [BranchResponse.model_validate(b) for b in branches]
