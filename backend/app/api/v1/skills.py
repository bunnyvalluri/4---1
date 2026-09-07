from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.skill import Skill, UserSkill, SkillCategory
from app.schemas.skill import SkillResponse, UserSkillResponse, UserSkillUpdate, SkillCreate

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=List[SkillResponse])
async def list_skills(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[SkillCategory] = None,
):
    stmt = select(Skill)
    if category:
        stmt = stmt.where(Skill.category == category)
    stmt = stmt.order_by(Skill.name.asc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/my-skills", response_model=List[UserSkillResponse])
async def get_my_skills(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = (
        select(UserSkill)
        .where(UserSkill.user_id == current_user.id)
        .options(selectinload(UserSkill.skill))
        .order_by(UserSkill.proficiency.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("/my-skills", response_model=UserSkillResponse)
async def update_my_skill(
    req: UserSkillUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = select(UserSkill).where(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == req.skill_id,
    )
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        existing.proficiency = req.proficiency
        await db.flush()
        target = existing
    else:
        new_us = UserSkill(
            user_id=current_user.id,
            skill_id=req.skill_id,
            proficiency=req.proficiency,
        )
        db.add(new_us)
        await db.flush()
        target = new_us

    # Reload with skill relationship
    stmt_reload = (
        select(UserSkill)
        .where(UserSkill.id == target.id)
        .options(selectinload(UserSkill.skill))
    )
    return (await db.execute(stmt_reload)).scalar_one()
