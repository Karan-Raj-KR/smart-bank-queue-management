from pydantic import BaseModel


class SummaryResponse(BaseModel):
    branch_id: int
    total_tokens_today: int
    average_wait_time_today: float
    busiest_hour_today: int | None
    no_show_count_today: int


class HourlyEntry(BaseModel):
    hour: int
    token_count: int
    average_wait_minutes: float


class HourlyResponse(BaseModel):
    branch_id: int
    data: list[HourlyEntry]


class ServiceBreakdownEntry(BaseModel):
    service_type: str
    token_count: int
    average_wait_minutes: float


class ServiceBreakdownResponse(BaseModel):
    branch_id: int
    data: list[ServiceBreakdownEntry]
