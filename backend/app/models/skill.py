import uuid
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Integer, Boolean, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.career import CareerSkill
    from app.models.recommendation import SkillGap


class SkillCategory(str, Enum):
    TECHNICAL = "TECHNICAL"
    SOFT = "SOFT"
    TOOL = "TOOL"
    FRAMEWORK = "FRAMEWORK"
    DATABASE = "DATABASE"
    CLOUD = "CLOUD"


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    category: Mapped[SkillCategory] = mapped_column(
        SQLEnum(SkillCategory, native_enum=False),
        default=SkillCategory.TECHNICAL,
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user_skills: Mapped[List["UserSkill"]] = relationship(
        "UserSkill", back_populates="skill", cascade="all, delete-orphan"
    )
    career_skills: Mapped[List["CareerSkill"]] = relationship(
        "CareerSkill", back_populates="skill", cascade="all, delete-orphan"
    )
    skill_gaps: Mapped[List["SkillGap"]] = relationship(
        "SkillGap", back_populates="skill", cascade="all, delete-orphan"
    )


class UserSkill(Base, TimestampMixin):
    __tablename__ = "user_skills"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
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
    skill_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    proficiency: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # 1 to 5
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="user_skills")
