from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ProjectBase(BaseModel):
    career_id: str
    title: str
    difficulty: str  # Beginner, Intermediate, Advanced
    tech_stack: List[str] = Field(default_factory=list)
    problem_statement: str
    expected_outcome: str
    skills_learned: List[str] = Field(default_factory=list)
    estimated_duration: str
    portfolio_value: str


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    career_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectFilter(BaseModel):
    career_id: Optional[str] = None
    difficulty: Optional[str] = None


class ProjectMatchBreakdown(BaseModel):
    career_alignment: float = Field(default=0.0, description="Max 30%")
    skill_gap_coverage: float = Field(default=0.0, description="Max 30%")
    skill_compatibility: float = Field(default=0.0, description="Max 15%")
    roadmap_alignment: float = Field(default=0.0, description="Max 10%")
    experience_level: float = Field(default=0.0, description="Max 10%")
    portfolio_value: float = Field(default=0.0, description="Max 5%")
    total_match_score: int = Field(default=0, description="Overall Match % (0-100)")


class SkillGapCoverageItem(BaseModel):
    skill_name: str
    coverage_percent: int
    current_level: str
    target_level: str


class ProjectRecommendationResponse(BaseModel):
    id: str
    career_id: str
    career_title: str
    title: str
    difficulty: str
    tech_stack: List[str]
    problem_statement: str
    expected_outcome: str
    skills_learned: List[str]
    estimated_duration: str
    portfolio_value: str
    match_score: int
    match_breakdown: ProjectMatchBreakdown
    why_recommended: List[str]
    skill_gaps_addressed: List[SkillGapCoverageItem]
    is_saved: bool = False
    is_active: bool = False
    is_completed: bool = False
    user_project_id: Optional[str] = None
    created_at: datetime


class ProjectDetailResponse(ProjectResponse):
    architecture_overview: str
    milestones_plan: List[Dict[str, Any]]
    expected_deliverables: List[str]
    recommended_resources: List[Dict[str, str]]
    match_score: Optional[int] = None
    match_breakdown: Optional[ProjectMatchBreakdown] = None
    why_recommended: List[str] = Field(default_factory=list)
    skill_gaps_addressed: List[SkillGapCoverageItem] = Field(default_factory=list)
    is_saved: bool = False
    user_project_id: Optional[str] = None
    user_project_status: Optional[str] = None


class UserProjectMilestoneResponse(BaseModel):
    id: str
    user_project_id: str
    title: str
    description: str
    status: str  # NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED
    order: int
    estimated_hours: float
    actual_hours: float
    dependencies: List[str] = Field(default_factory=list)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MilestoneStartRequest(BaseModel):
    notes: Optional[str] = None


class MilestoneCompleteRequest(BaseModel):
    actual_hours: Optional[float] = 0.0
    notes: Optional[str] = None


class DeliverablesUpdateRequest(BaseModel):
    deliverables: Dict[str, bool]


class EvidenceAddRequest(BaseModel):
    title: str
    type: str  # GITHUB, DEMO, DOCS, DIAGRAM, SCREENSHOT, REPORT
    url: str
    description: Optional[str] = None


class ConnectGithubRequest(BaseModel):
    repository_url: str


class TargetDateRequest(BaseModel):
    target_date: str  # YYYY-MM-DD


class ResolveBlockerRequest(BaseModel):
    resolution_note: Optional[str] = None


class UserProjectResponse(BaseModel):
    id: str
    user_id: str
    project_id: str
    roadmap_id: Optional[str] = None
    title: str
    career_title: str
    difficulty: str
    status: str
    progress: float
    started_at: Optional[datetime] = None
    target_completion_date: Optional[str] = None
    remaining_days: Optional[int] = None
    completed_at: Optional[datetime] = None
    estimated_hours: float
    actual_hours: float
    current_milestone: Optional[str] = None
    current_milestone_id: Optional[str] = None
    next_best_action: Optional[str] = None
    next_action_reason: Optional[str] = None
    portfolio_readiness: float
    deliverables: Dict[str, bool]
    evidence: List[Dict[str, Any]]
    github_data: Dict[str, Any]
    blocker_reason: Optional[str] = None
    milestones: List[UserProjectMilestoneResponse] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    tech_stack: List[str] = Field(default_factory=list)
    problem_statement: Optional[str] = None
    expected_outcome: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectStrategyResponse(BaseModel):
    target_career: str
    target_career_id: Optional[str] = None
    project_readiness: int
    active_projects_count: int
    completed_projects_count: int
    portfolio_strength: int
    top_skills_needed: List[str]
    current_development_focus: List[str]


class ProjectActivityItem(BaseModel):
    id: str
    title: str
    category: str
    relative_time: str
    timestamp: str
    icon: str


class ProjectAssistantRequest(BaseModel):
    message: str


class ProjectAssistantResponse(BaseModel):
    response: str
    suggested_action: Optional[str] = None
    current_milestone: Optional[str] = None


class SavedProjectResponse(BaseModel):
    id: str
    project_id: str
    saved_at: datetime
    project: Optional[ProjectResponse] = None

    model_config = ConfigDict(from_attributes=True)
