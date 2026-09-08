from datetime import datetime
from typing import Any, Dict, List, Optional
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
    created_at: Optional[datetime] = None

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
    skill: Optional[SkillResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# SKILL INTELLIGENCE CENTER SCHEMAS
# ==========================================================

class SkillAddRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Skill name or alias")
    category: Optional[str] = Field(default=None, description="Category: TECHNICAL, LANGUAGES, FRAMEWORKS, DATABASES, CLOUD, TOOLS, SOFT")
    proficiency: int = Field(default=2, ge=1, le=4, description="1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert")
    years_of_experience: float = Field(default=1.0, ge=0.0, le=50.0)
    evidence_source: Optional[str] = Field(default="Profile", description="Profile, Resume, Project, Certification, Assessment")


class SkillPatchRequest(BaseModel):
    proficiency: Optional[int] = Field(default=None, ge=1, le=4)
    years_of_experience: Optional[float] = Field(default=None, ge=0.0, le=50.0)
    category: Optional[str] = None
    evidence_source: Optional[str] = None


class SkillItemData(BaseModel):
    id: str
    name: str
    canonical_name: str
    category: str
    proficiency: int
    level: str  # Beginner, Intermediate, Advanced, Expert
    years_of_experience: float
    verified: bool
    confidence: str  # High, Medium, Low
    evidence_sources: List[str]
    last_updated: str
    learning_status: str  # Mastered, Proficient, In Progress, Target


class SkillMatrixRow(BaseModel):
    skill: str
    category: str
    user_proficiency: int
    user_level: str
    required_proficiency: int
    required_level: str
    gap: int
    gap_severity: str  # None, Low, Medium, High, Critical
    priority: str  # Critical, High, Medium, Low
    status: str  # Ready, Improve, Critical, Optional
    action_label: str


class CriticalGapDetail(BaseModel):
    rank: int
    skill: str
    category: str
    current_level: str
    target_level: str
    gap_severity: str
    priority: str
    why_it_matters: str
    recommended_module: str
    estimated_duration: str
    action_url: str


class LearningProgressDetail(BaseModel):
    skill: str
    current_progress: int
    current_level: str
    target_level: str
    estimated_completion: str
    status: str
    action_label: str
    action_url: str


class SkillEvidenceDetail(BaseModel):
    skill: str
    level: str
    verified: bool
    sources: List[str]
    resume_detected: bool
    project_backed: Optional[str] = None
    assessment_score: Optional[float] = None
    certifications: List[str] = []
    years_experience: float = 0.0


class NextBestSkillActionDetail(BaseModel):
    title: str
    reason: str
    progress: int
    action_label: str
    action_url: str
    priority: str


class AISkillInsightsDetail(BaseModel):
    strongest_area: str
    biggest_gap: str
    career_alignment_driver: str
    next_priority: str
    summary: str
    confidence_level: str
    confidence_reason: str


class CareerTargetDetail(BaseModel):
    id: str
    title: str
    slug: str
    match_score: int
    required_skills_count: int
    user_skills_count: int
    skill_coverage_pct: int
    category: str
    salary_range: str


class SkillOverviewMetricsData(BaseModel):
    total_skills: int
    verified_skills: int
    strong_skills: int
    skill_readiness_pct: int
    critical_gaps_count: int
    learning_count: int
    career_alignment_pct: int


class SkillHistoricalPoint(BaseModel):
    period: str
    skill: str
    proficiency_pct: int


class SkillIntelligenceProfileResponse(BaseModel):
    candidate: Dict[str, Any]
    metrics: SkillOverviewMetricsData
    target_career: CareerTargetDetail
    available_careers: List[Dict[str, Any]]
    categories: Dict[str, List[SkillItemData]]
    matrix: List[SkillMatrixRow]
    critical_gaps: List[CriticalGapDetail]
    next_action: NextBestSkillActionDetail
    learning_progress: List[LearningProgressDetail]
    evidence: List[SkillEvidenceDetail]
    ai_insights: AISkillInsightsDetail
    trend: List[SkillHistoricalPoint]
    live_status: Dict[str, Any]
