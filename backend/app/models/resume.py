import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.career import Career


class ResumeAnalysis(Base, TimestampMixin):
    __tablename__ = "resume_analyses"

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
    career_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("careers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ats_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0 to 100
    extracted_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    missing_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    formatting_issues: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    weak_bullet_points: Mapped[list] = mapped_column(JSON, default=list, nullable=False)  # list of {original, issue, suggested}
    suggested_keywords: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    recommendations: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(String(3000), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="resume_analyses")
    career: Mapped[Optional["Career"]] = relationship("Career", back_populates="resume_analyses")
