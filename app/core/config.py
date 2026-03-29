from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "Smart Bank Queue Management"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/bankqueue"

    # Redis
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
