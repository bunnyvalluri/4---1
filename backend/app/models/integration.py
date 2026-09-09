import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Boolean, ForeignKey, JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class GitHubConnection(Base):
    __tablename__ = "github_connections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"gh_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    github_username: Mapped[str] = mapped_column("github_username", String(100), nullable=False)
    access_token_encrypted: Mapped[str] = mapped_column("access_token_encrypted", String(1000), nullable=False)
    scopes: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    profile_data: Mapped[Optional[dict]] = mapped_column("profile_data", JSON, nullable=True)
    connected_at: Mapped[datetime] = mapped_column("connected_at", DateTime, default=utc_now, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column("updated_at", DateTime, default=utc_now, onupdate=utc_now, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="github_connection")


class GitLabConnection(Base):
    __tablename__ = "gitlab_connections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"gl_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    gitlab_username: Mapped[str] = mapped_column("gitlab_username", String(100), nullable=False)
    access_token_encrypted: Mapped[str] = mapped_column("access_token_encrypted", String(1000), nullable=False)
    scopes: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    profile_data: Mapped[Optional[dict]] = mapped_column("profile_data", JSON, nullable=True)
    connected_at: Mapped[datetime] = mapped_column("connected_at", DateTime, default=utc_now, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column("updated_at", DateTime, default=utc_now, onupdate=utc_now, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="gitlab_connection")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"wh_{uuid.uuid4().hex[:12]}")
    source: Mapped[str] = mapped_column(String(50), nullable=False)  # GITHUB, GITLAB
    event_type: Mapped[str] = mapped_column("event_type", String(100), nullable=False)
    delivery_id: Mapped[Optional[str]] = mapped_column("delivery_id", String(100), unique=True, nullable=True)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    processed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    processed_at: Mapped[Optional[datetime]] = mapped_column("processed_at", DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column("created_at", DateTime, default=utc_now, server_default=func.now(), nullable=False)


class CareerEvent(Base):
    __tablename__ = "career_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    user_id: Mapped[str] = mapped_column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column("event_type", String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column("created_at", DateTime, default=utc_now, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="career_events")
