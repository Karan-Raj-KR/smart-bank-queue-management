from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.token import TokenCreate, TokenResponse
from app.services.token_service import generate_token

router = APIRouter(prefix="/tokens", tags=["tokens"])


@router.post("/generate", response_model=TokenResponse, status_code=201)
async def generate_token_endpoint(
    payload: TokenCreate, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    return await generate_token(db, payload)
