import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.skill import Skill
    from app.models.recommendation import CareerRecommendation, SkillGap
    from app.models.roadmap import Roadmap
    from app.models.project import ProjectRecommendation
    from app.models.resume import ResumeAnalysis


class Career(Base, TimestampMixin):
    __tablename__ = "careers"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    title: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    salary_range: Mapped[str] = mapped_column(String(100), nullable=False)
    demand_level: Mapped[str] = mapped_column(String(50), default="High", nullable=False)
    experience_level: Mapped[str] = mapped_column(String(50), default="Entry / Mid", nullable=False)
    overview: Mapped[str] = mapped_column(String(3000), nullable=False)
    education_reqs: Mapped[str] = mapped_column(String(1000), nullable=False)
    aptitude_reqs: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    common_job_titles: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    skills: Mapped[List["CareerSkill"]] = relationship(
        "CareerSkill", back_populates="career", cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["CareerRecommendation"]] = relationship(
        "CareerRecommendation", back_populates="career", cascade="all, delete-orphan"
    )
    skill_gaps: Mapped[List["SkillGap"]] = relationship(
        "SkillGap", back_populates="career", cascade="all, delete-orphan"
    )
    roadmaps: Mapped[List["Roadmap"]] = relationship(
        "Roadmap", back_populates="career", cascade="all, delete-orphan"
    )
    project_suggestions: Mapped[List["ProjectRecommendation"]] = relationship(
        "ProjectRecommendation", back_populates="career", cascade="all, delete-orphan"
    )
    resume_analyses: Mapped[List["ResumeAnalysis"]] = relationship(
        "ResumeAnalysis", back_populates="career"
    )


class CareerSkill(Base, TimestampMixin):
    __tablename__ = "career_skills"
    __table_args__ = (
        UniqueConstraint("career_id", "skill_id", name="uq_career_skill"),
    )

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
    skill_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    min_proficiency: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    # Relationships
    career: Mapped["Career"] = relationship("Career", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="career_skills")
