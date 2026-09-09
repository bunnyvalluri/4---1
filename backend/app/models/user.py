import uuid
from enum import Enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.models.education import Education
    from app.models.skill import UserSkill
    from app.models.assessment import AptitudeAttempt
    from app.models.recommendation import CareerRecommendation, SkillGap
    from app.models.roadmap import Roadmap
    from app.models.resume import ResumeAnalysis
    from app.models.chat import ChatSession
    from app.models.notification import Notification
    from app.models.assignment import AssignmentSubmission
    from app.models.integration import GitHubConnection, GitLabConnection, CareerEvent


class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column("passwordHash", String(255), nullable=False)
    role: Mapped[Role] = mapped_column(
        SQLEnum(Role, native_enum=False),
        default=Role.USER,
        nullable=False,
    )
    avatar: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        "created_at",
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at",
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    profile: Mapped[Optional["Profile"]] = relationship(
        "Profile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    education_history: Mapped[List["Education"]] = relationship(
        "Education", back_populates="user", cascade="all, delete-orphan"
    )
    skills: Mapped[List["UserSkill"]] = relationship(
        "UserSkill", back_populates="user", cascade="all, delete-orphan"
    )
    aptitude_attempts: Mapped[List["AptitudeAttempt"]] = relationship(
        "AptitudeAttempt", back_populates="user", cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["CareerRecommendation"]] = relationship(
        "CareerRecommendation", back_populates="user", cascade="all, delete-orphan"
    )
    skill_gaps: Mapped[List["SkillGap"]] = relationship(
        "SkillGap", back_populates="user", cascade="all, delete-orphan"
    )
    roadmaps: Mapped[List["Roadmap"]] = relationship(
        "Roadmap", back_populates="user", cascade="all, delete-orphan"
    )
    resume_analyses: Mapped[List["ResumeAnalysis"]] = relationship(
        "ResumeAnalysis", back_populates="user", cascade="all, delete-orphan"
    )
    chat_sessions: Mapped[List["ChatSession"]] = relationship(
        "ChatSession", back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    assignment_submissions: Mapped[List["AssignmentSubmission"]] = relationship(
        "AssignmentSubmission", back_populates="user", cascade="all, delete-orphan"
    )
    github_connection: Mapped[Optional["GitHubConnection"]] = relationship(
        "GitHubConnection", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    gitlab_connection: Mapped[Optional["GitLabConnection"]] = relationship(
        "GitLabConnection", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    career_events: Mapped[List["CareerEvent"]] = relationship(
        "CareerEvent", back_populates="user", cascade="all, delete-orphan"
    )
