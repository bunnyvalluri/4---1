import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, Integer, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.career import Career
    from app.models.skill import Skill


class CareerRecommendation(Base, TimestampMixin):
    __tablename__ = "career_recommendations"
    __table_args__ = (
        UniqueConstraint("user_id", "career_id", name="uq_user_career_rec"),
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
    match_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0 to 100
    matching_skills: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    missing_skills: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    reasoning: Mapped[str] = mapped_column(String(3000), nullable=False)
    breakdown: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    recommended_actions: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="recommendations")
    career: Mapped["Career"] = relationship("Career", back_populates="recommendations")


class SkillGap(Base, TimestampMixin):
    __tablename__ = "skill_gaps"
    __table_args__ = (
        UniqueConstraint("user_id", "career_id", "skill_id", name="uq_user_career_skill_gap"),
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
    skill_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    current_proficiency: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    required_proficiency: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    gap_severity: Mapped[str] = mapped_column(String(50), default="Moderate", nullable=False)  # Low, Moderate, High, Critical
    priority: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # 1 (highest) to 5
    suggested_resource: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="skill_gaps")
    career: Mapped["Career"] = relationship("Career", back_populates="skill_gaps")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="skill_gaps")
