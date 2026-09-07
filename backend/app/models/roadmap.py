import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.career import Career


class Roadmap(Base, TimestampMixin):
    __tablename__ = "roadmaps"
    __table_args__ = (
        UniqueConstraint("user_id", "career_id", name="uq_user_career_roadmap"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    career_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("careers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    duration_months: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="roadmaps")
    career: Mapped["Career"] = relationship("Career", back_populates="roadmaps")
    items: Mapped[List["RoadmapItem"]] = relationship(
        "RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapItem.month"
    )


class RoadmapItem(Base, TimestampMixin):
    __tablename__ = "roadmap_items"
    __table_args__ = (
        Index("ix_roadmap_month", "roadmap_id", "month"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    roadmap_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("roadmaps.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    tasks: Mapped[list] = mapped_column(JSON, default=list, nullable=False)  # list of {id, text, done}
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    roadmap: Mapped["Roadmap"] = relationship("Roadmap", back_populates="items")
