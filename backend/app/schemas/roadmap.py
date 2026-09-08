from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class RoadmapResourceLink(BaseModel):
    id: str
    title: str
    url: str
    type: str = "Documentation"  # Documentation, Course, Tutorial, Article, Practice, Video
    is_completed: bool = False


class RoadmapTaskItem(BaseModel):
    id: str
    text: str
    done: bool = False


class RoadmapItemResponse(BaseModel):
    id: str
    month: int
    phase_id: str = "phase_1"
    title: str
    description: str
    item_type: str = "learning"  # learning, practice, project, assessment, certification, resume, interview, application
    priority: str = "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW
    status: str = "NOT_STARTED"  # LOCKED, NOT_STARTED, IN_PROGRESS, COMPLETED, SKIPPED
    skills: List[str] = Field(default_factory=list)
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    estimated_hours: float = 20.0
    actual_hours: float = 0.0
    item_order: int = 1
    dependencies: List[str] = Field(default_factory=list)
    resource_links: List[RoadmapResourceLink] = Field(default_factory=list)
    project_id: Optional[str] = None
    is_completed: bool = False
    notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CareerReadinessBreakdown(BaseModel):
    readiness_score: float = 0.0
    skill_coverage: float = 0.0
    assessment_fit: float = 0.0
    resume_evidence: float = 0.0
    project_readiness: float = 0.0
    roadmap_completion: float = 0.0


class RoadmapIntelligenceInfo(BaseModel):
    verified_skills_count: int = 0
    skill_gaps_count: int = 0
    assessment_fit_pct: float = 0.0
    resume_points_count: int = 0
    target_career: str = ""


class RoadmapPhaseResponse(BaseModel):
    id: str
    month: int
    title: str
    subtitle: str
    description: str
    status: str = "NOT_STARTED"  # LOCKED, IN_PROGRESS, COMPLETED
    progress_percent: float = 0.0
    target_skills: List[str] = Field(default_factory=list)
    items_count: int = 0
    completed_items_count: int = 0


class NextBestActionResponse(BaseModel):
    item_id: Optional[str] = None
    title: str = "Start your foundation roadmap"
    phase_id: Optional[str] = None
    priority: str = "HIGH"
    estimated_hours: float = 1.0
    estimated_minutes: int = 60
    reason: str = "This addresses the primary required competency for your target career."
    action_label: str = "Start Task"
    action_url: str = "/roadmap"


class RoadmapGenerateRequest(BaseModel):
    career_id: str
    duration_months: Optional[int] = 6
    hours_per_week: Optional[int] = 10
    learning_pace: Optional[str] = "balanced"  # fast_track, balanced, flexible


class RoadmapSettingsUpdate(BaseModel):
    hours_per_week: Optional[int] = Field(default=None, ge=1, le=80)
    learning_pace: Optional[str] = None  # fast_track, balanced, flexible


class RoadmapRegenerateRequest(BaseModel):
    reason: Optional[str] = "User requested curriculum recalibration"
    hours_per_week: Optional[int] = None
    learning_pace: Optional[str] = None
    career_id: Optional[str] = None


class RoadmapItemUpdate(BaseModel):
    is_completed: Optional[bool] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None
    actual_hours: Optional[float] = None
    status: Optional[str] = None


class RoadmapProgressResponse(BaseModel):
    roadmap_id: str
    overall_progress: float
    career_readiness_score: float
    completed_hours: float
    total_hours: float
    completed_items: int
    total_items: int
    active_phase_id: str
    next_best_action: Optional[NextBestActionResponse] = None


class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    career_id: str
    career_title: Optional[str] = None
    title: str
    description: str
    duration_months: int
    progress_percent: float
    status: str
    version: int = 1
    hours_per_week: int = 10
    learning_pace: str = "balanced"
    career_readiness_score: float = 0.0
    readiness_breakdown: CareerReadinessBreakdown = Field(default_factory=CareerReadinessBreakdown)
    roadmap_intelligence: RoadmapIntelligenceInfo = Field(default_factory=RoadmapIntelligenceInfo)
    estimated_total_hours: float = 120.0
    completed_hours: float = 0.0
    estimated_completion_date: Optional[str] = None
    phases: List[RoadmapPhaseResponse] = Field(default_factory=list)
    milestones: List[Dict[str, Any]] = Field(default_factory=list)
    items: List[RoadmapItemResponse] = Field(default_factory=list)
    next_best_action: Optional[NextBestActionResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
