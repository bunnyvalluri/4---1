import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.career import Career
    from app.models.user import User


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
    user_projects: Mapped[List["UserProject"]] = relationship("UserProject", back_populates="project", cascade="all, delete-orphan")


class UserProject(Base, TimestampMixin):
    __tablename__ = "user_projects"

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
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("project_recommendations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    roadmap_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        default="IN_PROGRESS",
        nullable=False,
    )  # NOT_STARTED, PLANNED, IN_PROGRESS, BLOCKED, COMPLETED, ARCHIVED
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    target_completion_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_hours: Mapped[float] = mapped_column(Float, default=40.0, nullable=False)
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Deliverables & Evidence checklists
    deliverables: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "readme": False,
            "architecture": False,
            "api_documentation": False,
            "tests": False,
            "deployment": False,
            "demo": False,
        },
        nullable=False,
    )
    evidence: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    github_data: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "connected": False,
            "repositoryUrl": "",
            "repositoryName": "",
            "defaultBranch": "main",
            "lastSyncedAt": None,
            "commitCount": 0,
            "pullRequestCount": 0,
        },
        nullable=False,
    )
    blocker_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", backref="projects")
    project: Mapped["ProjectRecommendation"] = relationship("ProjectRecommendation", back_populates="user_projects")
    milestones: Mapped[List["UserProjectMilestone"]] = relationship(
        "UserProjectMilestone",
        back_populates="user_project",
        cascade="all, delete-orphan",
        order_by="UserProjectMilestone.order",
    )


class UserProjectMilestone(Base, TimestampMixin):
    __tablename__ = "user_project_milestones"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    user_project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user_projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50),
        default="NOT_STARTED",
        nullable=False,
    )  # NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED
    order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    estimated_hours: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    dependencies: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user_project: Mapped["UserProject"] = relationship("UserProject", back_populates="milestones")


class SavedProject(Base, TimestampMixin):
    __tablename__ = "saved_projects"
    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="uq_user_saved_project"),
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
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("project_recommendations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    project: Mapped["ProjectRecommendation"] = relationship("ProjectRecommendation")
