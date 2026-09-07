from typing import Annotated, Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.career import Career
from app.models.skill import Skill
from app.models.assessment import AptitudeAttempt
from app.models.resume import ResumeAnalysis

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/metrics")
async def get_system_metrics(
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    career_count = (await db.execute(select(func.count(Career.id)))).scalar() or 0
    skill_count = (await db.execute(select(func.count(Skill.id)))).scalar() or 0
    assessment_count = (await db.execute(select(func.count(AptitudeAttempt.id)))).scalar() or 0
    resume_count = (await db.execute(select(func.count(ResumeAnalysis.id)))).scalar() or 0

    return {
        "total_users": user_count,
        "total_careers": career_count,
        "total_skills": skill_count,
        "total_assessments_taken": assessment_count,
        "total_resumes_analyzed": resume_count,
        "platform_health": "OPTIMAL",
    }
