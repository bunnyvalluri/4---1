from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class BulletImprovement(BaseModel):
    original: str
    issue: str
    suggested: str


class ResumeUploadResponse(BaseModel):
    id: str
    file_name: str
    message: str


class ResumeAnalysisResponse(BaseModel):
    id: str
    user_id: str
    career_id: Optional[str] = None
    file_name: str
    ats_score: float
    extracted_skills: List[str]
    missing_skills: List[str]
    formatting_issues: List[str]
    weak_bullet_points: List[Dict[str, Any]]
    suggested_keywords: List[str]
    recommendations: List[str]
    summary: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BulletOptimizationRequest(BaseModel):
    bullet_text: str
    target_role: Optional[str] = None
