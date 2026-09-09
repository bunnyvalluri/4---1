import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, Integer, ForeignKey, JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.career import Career


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


from sqlalchemy.dialects.postgresql import ARRAY

TextArray = ARRAY(String).with_variant(JSON, "sqlite")

class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"asgn_{uuid.uuid4().hex[:12]}")
    roadmap_item_id: Mapped[Optional[str]] = mapped_column("roadmap_item_id", String(36), nullable=True)
    career_id: Mapped[str] = mapped_column("career_id", String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(3000), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="Intermediate", nullable=False)
    estimated_hours: Mapped[float] = mapped_column("estimated_hours", Float, default=4.0, nullable=False)
    skills: Mapped[List[str]] = mapped_column(TextArray, default=list, nullable=False)
    prerequisites: Mapped[List[str]] = mapped_column(TextArray, default=list, nullable=False)
    instructions: Mapped[str] = mapped_column(String(5000), nullable=False)
    requirements: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    acceptance_criteria: Mapped[list] = mapped_column("acceptance_criteria", JSON, default=list, nullable=False)
    submission_type: Mapped[str] = mapped_column("submission_type", String(50), default="GITHUB", nullable=False)
    starter_repo_url: Mapped[Optional[str]] = mapped_column("starter_repo_url", String(512), nullable=True)
    automated_tests: Mapped[Optional[dict]] = mapped_column("automated_tests", JSON, nullable=True)
    resources: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="AVAILABLE", nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column("created_at", DateTime, default=utc_now, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column("updated_at", DateTime, default=utc_now, onupdate=utc_now, server_default=func.now(), nullable=False)

    # Relationships
    career: Mapped["Career"] = relationship("Career", back_populates="assignments")
    submissions: Mapped[List["AssignmentSubmission"]] = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"sub_{uuid.uuid4().hex[:12]}")
    assignment_id: Mapped[str] = mapped_column("assignment_id", String(36), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_type: Mapped[str] = mapped_column("submission_type", String(50), default="GITHUB", nullable=False)
    repo_url: Mapped[Optional[str]] = mapped_column("repo_url", String(512), nullable=True)
    branch: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    commit_sha: Mapped[Optional[str]] = mapped_column("commit_sha", String(100), nullable=True)
    commit_message: Mapped[Optional[str]] = mapped_column("commit_message", String(500), nullable=True)
    pr_url: Mapped[Optional[str]] = mapped_column("pr_url", String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="WAITING", nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tests_passed: Mapped[int] = mapped_column("tests_passed", Integer, default=0, nullable=False)
    tests_total: Mapped[int] = mapped_column("tests_total", Integer, default=0, nullable=False)
    coverage_percent: Mapped[float] = mapped_column("coverage_percent", Float, default=0.0, nullable=False)
    lint_status: Mapped[str] = mapped_column("lint_status", String(50), default="PENDING", nullable=False)
    build_status: Mapped[str] = mapped_column("build_status", String(50), default="PENDING", nullable=False)
    security_status: Mapped[str] = mapped_column("security_status", String(50), default="PENDING", nullable=False)
    ai_review: Mapped[Optional[dict]] = mapped_column("ai_review", JSON, nullable=True)
    raw_ci_output: Mapped[Optional[str]] = mapped_column("raw_ci_output", String(10000), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column("submitted_at", DateTime, default=utc_now, server_default=func.now(), nullable=False)
    evaluated_at: Mapped[Optional[datetime]] = mapped_column("evaluated_at", DateTime, nullable=True)

    # Relationships
    assignment: Mapped["Assignment"] = relationship("Assignment", back_populates="submissions")
    user: Mapped["User"] = relationship("User", back_populates="assignment_submissions")
