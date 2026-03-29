import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.service_type import ServiceType


class TokenStatus(str, enum.Enum):
    WAITING = "waiting"
    CALLED = "called"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class Token(Base):
    __tablename__ = "tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    token_number: Mapped[str] = mapped_column(String(20), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    counter_id: Mapped[int | None] = mapped_column(ForeignKey("counters.id"))
    service_type: Mapped[ServiceType] = mapped_column(
        Enum(ServiceType, name="servicetype"), nullable=False
    )
    status: Mapped[TokenStatus] = mapped_column(
        Enum(TokenStatus, name="tokenstatus"),
        default=TokenStatus.WAITING,
        nullable=False,
    )
    is_priority: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(server_default=func.now())
    called_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    branch: Mapped["Branch"] = relationship(back_populates="tokens")
    customer: Mapped["Customer"] = relationship(back_populates="tokens")
    counter: Mapped["Counter | None"] = relationship(back_populates="tokens")
