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


class BreakdownFactor(BaseModel):
    name: str
    score: float
    weight_percent: float
    weighted_points: float
    status: str  # "positive" | "neutral" | "needs_work"
    insight: str


class RecommendationBreakdown(BaseModel):
    skills_score: float = 0.0
    interests_score: float = 0.0
    aptitude_score: float = 0.0
    education_score: float = 0.0
    experience_score: float = 0.0
    preference_score: float = 0.0
    confidence_score: float = 85.0
    contributing_factors: List[Dict[str, Any]] = []


class RecommendationResponse(BaseModel):
    id: str
    user_id: str
    career_id: str
    match_score: float
    match_level: str = ""  # "Excellent Match", "Strong Match", etc.
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


# ──────────────────────────────────────────────
# New schemas for the enhanced recommendations page
# ──────────────────────────────────────────────

class RecommendationStatusResponse(BaseModel):
    """Overall status of the user's recommendations."""
    status: str  # "up_to_date" | "stale" | "generating" | "no_data" | "error"
    last_analyzed: Optional[str] = None  # ISO timestamp
    last_analyzed_relative: Optional[str] = None  # "2 minutes ago"
    is_stale: bool = False
    profile_complete: bool = True
    profile_completion_pct: int = 0
    missing_profile_items: List[str] = []
    active_job_id: Optional[str] = None
    recommendation_count: int = 0


class RecalculateJobResponse(BaseModel):
    """Response when a recalculation job is started."""
    job_id: str
    status: str = "queued"
    message: str = "Recalculation queued"


class JobStatusResponse(BaseModel):
    """Real-time job status for recommendation recalculation."""
    job_id: str
    status: str  # "queued" | "processing" | "completed" | "failed"
    stage: Optional[str] = None  # "profile_fetch" | "skill_analysis" | "career_scoring" | "gap_analysis" | "finalizing"
    stage_label: Optional[str] = None  # Human-readable stage description
    progress: int = 0  # 0–100 (reflects actual stages, not fake)
    message: Optional[str] = None
    error: Optional[str] = None
    completed_at: Optional[str] = None


class CareerComparisonEntry(BaseModel):
    """A single career's data in the comparison matrix."""
    career_id: str
    title: str
    category: str
    match_score: float
    match_level: str
    skills_score: float
    interests_score: float
    aptitude_score: float
    education_score: float
    experience_score: float
    skill_gap_count: int
    skill_gap_severity: str  # "Low" | "Medium" | "High"
    top_missing_skill: Optional[str] = None
    salary_range: Optional[str] = None


class CareerComparisonResponse(BaseModel):
    """Comparison matrix for 2–3 selected careers."""
    careers: List[CareerComparisonEntry]
    best_overall: str  # career_id
    lowest_gap: str  # career_id
    best_interest_fit: str  # career_id


class EnhancedRecommendationItem(BaseModel):
    """Full recommendation record enriched for the page."""
    id: str
    rank: int
    career_id: str
    career_title: str
    career_category: str
    career_slug: str
    career_salary_range: str
    career_demand_level: str
    career_experience_level: str
    match_score: float
    match_level: str
    skills_score: float
    interests_score: float
    aptitude_score: float
    education_score: float
    experience_score: float
    preference_score: float
    confidence_score: float
    matching_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    reasoning: str
    breakdown: Dict[str, Any]
    recommended_actions: List[str]
    top_strength: str = ""
    primary_gap: str = ""
    updated_at: str


class RecommendationsListResponse(BaseModel):
    """Paginated / filtered list of recommendations."""
    items: List[EnhancedRecommendationItem]
    total: int
    top_match: Optional[EnhancedRecommendationItem] = None
    status: RecommendationStatusResponse
    categories: List[str] = []
