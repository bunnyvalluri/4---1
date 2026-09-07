from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.skill import SkillCategory


class SkillBase(BaseModel):
    name: str
    category: SkillCategory = SkillCategory.TECHNICAL
    description: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserSkillUpdate(BaseModel):
    skill_id: str
    proficiency: int = Field(..., ge=1, le=5)


class UserSkillResponse(BaseModel):
    id: str
    user_id: str
    skill_id: str
    proficiency: int
    verified: bool
    skill: SkillResponse

    model_config = ConfigDict(from_attributes=True)
