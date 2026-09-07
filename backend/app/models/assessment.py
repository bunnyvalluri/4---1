import uuid
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, Integer, ForeignKey, JSON, Enum as SQLEnum
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
    score: Mapped[float] = mapped_column(Float, nullable=False)  # Percentage 0-100
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    category_scores: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    strengths: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    weaknesses: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="aptitude_attempts")
