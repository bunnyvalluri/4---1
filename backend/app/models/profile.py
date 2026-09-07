import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: uuid.uuid4().hex,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    degree: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    branch: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    college: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    grad_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cgpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    interests: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    preferred_industries: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    preferred_roles: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    preferred_locations: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    career_goals: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    work_experience_years: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    github_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")
