import uuid
from typing import TYPE_CHECKING, List
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.career import Career


class ProjectRecommendation(Base, TimestampMixin):
    __tablename__ = "project_recommendations"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    career_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("careers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)  # Beginner, Intermediate, Advanced
    tech_stack: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    problem_statement: Mapped[str] = mapped_column(String(3000), nullable=False)
    expected_outcome: Mapped[str] = mapped_column(String(2000), nullable=False)
    skills_learned: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    estimated_duration: Mapped[str] = mapped_column(String(100), nullable=False)
    portfolio_value: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    career: Mapped["Career"] = relationship("Career", back_populates="project_suggestions")
