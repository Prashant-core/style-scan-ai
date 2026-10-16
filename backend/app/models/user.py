import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, utcnow


class User(Base):
    __tablename__ = "users"

    # Every user gets a unique random ID that cannot be guessed
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name: Mapped[str] = mapped_column(String(80))
    username: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(128))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    scans: Mapped[list["ScanHistory"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    images: Mapped[list["StoredImage"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )