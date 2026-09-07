from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.career import CareerResponse
from app.schemas.skill import SkillResponse


class MatchedSkillDetail(BaseModel):
    skill_id: str
    name: str
    user_proficiency: int
    required_proficiency: int
    matched: bool


class RecommendationResponse(BaseModel):
    id: str
    user_id: str
    career_id: str
    match_score: float
    matching_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    reasoning: str
    breakdown: Dict[str, Any]
    recommended_actions: List[str]
    career: Optional[CareerResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SkillGapResponse(BaseModel):
    id: str
    user_id: str
    career_id: str
    skill_id: str
    current_proficiency: int
    required_proficiency: int
    gap_severity: str
    priority: int
    suggested_resource: Optional[str] = None
    skill: Optional[SkillResponse] = None
    career: Optional[CareerResponse] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
