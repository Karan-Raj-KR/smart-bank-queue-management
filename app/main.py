from fastapi import FastAPI

from app.routers import counter, token, websocket

app = FastAPI(title="Smart Bank Queue Management", version="0.1.0")

app.include_router(token.router)
app.include_router(counter.router)
app.include_router(websocket.router)


@app.get("/")
async def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
