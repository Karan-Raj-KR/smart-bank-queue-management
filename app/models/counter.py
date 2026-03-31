from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base


class Counter(Base):
    __tablename__ = "counters"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    service_types: Mapped[list[str]] = mapped_column(
        ARRAY(String), nullable=False, default=list
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    branch: Mapped["Branch"] = relationship(back_populates="counters")
    tokens: Mapped[list["Token"]] = relationship(back_populates="counter")
