import uuid
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

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


class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(
        SQLEnum(Role, native_enum=False),
        default=Role.USER,
        nullable=False,
    )
    avatar: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

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
