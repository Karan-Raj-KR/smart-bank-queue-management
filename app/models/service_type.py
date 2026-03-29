import enum


class ServiceType(str, enum.Enum):
    CASH = "CASH"
    WITHDRAWAL = "WITHDRAWAL"
    LOAN = "LOAN"
    ACCOUNT = "ACCOUNT"
