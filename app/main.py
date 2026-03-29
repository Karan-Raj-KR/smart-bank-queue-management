from fastapi import FastAPI

app = FastAPI(title="Smart Bank Queue Management", version="0.1.0")


@app.get("/")
async def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
