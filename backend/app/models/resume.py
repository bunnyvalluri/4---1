import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, ForeignKey, JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.career import Career


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


from sqlalchemy.dialects.postgresql import ARRAY

TextArray = ARRAY(String).with_variant(JSON, "sqlite")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: f"res_{uuid.uuid4().hex[:12]}",
    )
    user_id: Mapped[str] = mapped_column(
        "user_id",
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    career_id: Mapped[Optional[str]] = mapped_column(
        "career_id",
        String(36),
        ForeignKey("careers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    file_name: Mapped[str] = mapped_column("file_name", String(255), nullable=False)
    ats_score: Mapped[float] = mapped_column("ats_score", Float, nullable=False)  # 0 to 100
    extracted_skills: Mapped[List[str]] = mapped_column("extracted_skills", TextArray, default=list, nullable=False)
    missing_skills: Mapped[List[str]] = mapped_column("missing_skills", TextArray, default=list, nullable=False)
    formatting_issues: Mapped[List[str]] = mapped_column("formatting_issues", TextArray, default=list, nullable=False)
    weak_bullet_points: Mapped[list] = mapped_column("weak_bullet_points", JSON, default=list, nullable=False)
    suggested_keywords: Mapped[List[str]] = mapped_column("suggested_keywords", TextArray, default=list, nullable=False)
    recommendations: Mapped[List[str]] = mapped_column(TextArray, default=list, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(String(3000), nullable=True)

    # Enhanced structured fields
    raw_text: Mapped[Optional[str]] = mapped_column("raw_text", String(50000), nullable=True)
    storage_path: Mapped[Optional[str]] = mapped_column("storage_path", String(512), nullable=True)
    personal_info: Mapped[Optional[dict]] = mapped_column("personal_info", JSON, nullable=True)
    education: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    experience: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    projects: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    certifications: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    career_signals: Mapped[Optional[dict]] = mapped_column("career_signals", JSON, nullable=True)
    ranked_careers: Mapped[Optional[list]] = mapped_column("ranked_careers", JSON, nullable=True)
    sub_scores: Mapped[Optional[dict]] = mapped_column("sub_scores", JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        "created_at",
        DateTime,
        default=utc_now,
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="resume_analyses")
    career: Mapped[Optional["Career"]] = relationship("Career", back_populates="resume_analyses")
