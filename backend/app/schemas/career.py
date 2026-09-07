from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.skill import SkillResponse


class CareerSkillResponse(BaseModel):
    id: str
    skill_id: str
    is_required: bool
    min_proficiency: int
    weight: float
    skill: SkillResponse

    model_config = ConfigDict(from_attributes=True)


class CareerBase(BaseModel):
    title: str
    slug: str
    category: str
    description: str
    salary_range: str
    demand_level: str = "High"
    experience_level: str = "Entry / Mid"
    overview: str
    education_reqs: str
    aptitude_reqs: Dict[str, Any] = Field(default_factory=dict)
    common_job_titles: List[str] = Field(default_factory=list)


class CareerCreate(CareerBase):
    pass


class CareerResponse(CareerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CareerDetailResponse(CareerResponse):
    skills: List[CareerSkillResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class CareerFilter(BaseModel):
    category: Optional[str] = None
    demand_level: Optional[str] = None
    search: Optional[str] = None
