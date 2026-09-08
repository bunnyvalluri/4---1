import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional, Dict, Any
from sqlalchemy import String, Float, Integer, ForeignKey, JSON, Enum as SQLEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class AptitudeCategory(str, Enum):
    LOGICAL = "LOGICAL"
    QUANTITATIVE = "QUANTITATIVE"
    VERBAL = "VERBAL"
    ANALYTICAL = "ANALYTICAL"
    PROBLEM_SOLVING = "PROBLEM_SOLVING"


class AssessmentAttemptStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"
    ABANDONED = "ABANDONED"


class AptitudeQuestion(Base, TimestampMixin):
    __tablename__ = "aptitude_questions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    category: Mapped[AptitudeCategory] = mapped_column(
        SQLEnum(AptitudeCategory, native_enum=False),
        nullable=False,
        index=True,
    )
    question: Mapped[str] = mapped_column(String(2000), nullable=False)
    options: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    correct_option: Mapped[int] = mapped_column(Integer, nullable=False)  # 0-indexed
    explanation: Mapped[str] = mapped_column(String(2000), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="Medium", nullable=False)


class AptitudeAttempt(Base, TimestampMixin):
    __tablename__ = "aptitude_attempts"

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
    status: Mapped[str] = mapped_column(
        String(30),
        default=AssessmentAttemptStatus.IN_PROGRESS.value,
        nullable=False,
        index=True,
    )
    current_question_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    answers_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    flagged_questions: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    section_progress: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # Percentage 0-100
    total_questions: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    category_scores: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    strengths: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    weaknesses: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    ai_insights: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    career_impacts: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_activity_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="aptitude_attempts")
