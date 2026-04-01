import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.branch import Branch
from app.models.counter import Counter
from app.routers import analytics, counter, token, websocket
from app.routers.branch import router as branch_router

app = FastAPI(title="Smart Bank Queue Management", version="0.1.0")

_allowed_origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(token.router)
app.include_router(counter.router)
app.include_router(websocket.router)
app.include_router(analytics.router)
app.include_router(branch_router)


@app.get("/")
async def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.on_event("startup")
async def auto_seed():
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Branch).limit(1))
        if result.scalar_one_or_none() is not None:
            return

        branch = Branch(name="Main Branch", address="MG Road, Bangalore")
        db.add(branch)
        await db.flush()

        default_counter = Counter(
            branch_id=branch.id,
            name="Counter 1",
            service_types=["CASH", "WITHDRAWAL", "LOAN", "ACCOUNT"],
        )
        db.add(default_counter)
        await db.commit()


@app.post("/seed")
async def seed_data(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Branch).limit(1))
    if result.scalar_one_or_none() is not None:
        return {"message": "Already seeded"}

    branch = Branch(name="Main Branch", address="MG Road, Bangalore")
    db.add(branch)
    await db.flush()

    default_counter = Counter(
        branch_id=branch.id,
        name="Counter 1",
        service_types=["CASH", "WITHDRAWAL", "LOAN", "ACCOUNT"],
    )
    db.add(default_counter)
    await db.flush()

    return {
        "message": "Seeded successfully",
        "branch_id": branch.id,
        "counter_id": default_counter.id,
    }
