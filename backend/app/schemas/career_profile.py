from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, HttpUrl


class SkillCategory(str, Enum):
    TECHNICAL = "TECHNICAL"
    SOFT = "SOFT"
    TOOL = "TOOL"
    FRAMEWORK = "FRAMEWORK"
    DATABASE = "DATABASE"
    CLOUD = "CLOUD"


class SkillProficiency(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"


class SkillVerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    SELF_REPORTED = "SELF_REPORTED"
    ASSESSMENT_BASED = "ASSESSMENT_BASED"
    RESUME_DERIVED = "RESUME_DERIVED"


class EmploymentType(str, Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    INTERNSHIP = "INTERNSHIP"
    FREELANCE = "FREELANCE"
    CONTRACT = "CONTRACT"


class ProjectStatus(str, Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class WorkMode(str, Enum):
    REMOTE = "REMOTE"
    HYBRID = "HYBRID"
    ON_SITE = "ON_SITE"


# ====================================================================
# SUB-ENTITY SCHEMAS
# ====================================================================

class PersonalInfoUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=120)
    headline: Optional[str] = Field(None, max_length=160)
    bio: Optional[str] = Field(None, max_length=1000)
    avatar_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class EducationItem(BaseModel):
    id: Optional[str] = None
    institution: str = Field(..., min_length=2, max_length=150)
    degree: str = Field(..., min_length=2, max_length=100)
    field_of_study: Optional[str] = Field(None, max_length=100)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_studying: bool = False
    grade: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=500)


class ExperienceItem(BaseModel):
    id: Optional[str] = None
    company: str = Field(..., min_length=2, max_length=120)
    role: str = Field(..., min_length=2, max_length=100)
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    location: Optional[str] = Field(None, max_length=100)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_working: bool = False
    description: Optional[str] = Field(None, max_length=1000)
    technologies: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)


class SkillItem(BaseModel):
    id: Optional[str] = None
    skill_name: str = Field(..., min_length=1, max_length=80)
    category: SkillCategory = SkillCategory.TECHNICAL
    proficiency: SkillProficiency = SkillProficiency.INTERMEDIATE
    proficiency_numeric: int = Field(default=3, ge=1, le=5)
    years_of_experience: float = Field(default=1.0, ge=0.0, le=50.0)
    verification_status: SkillVerificationStatus = SkillVerificationStatus.SELF_REPORTED


class ProjectItem(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    role: Optional[str] = Field(None, max_length=80)
    technologies: List[str] = Field(default_factory=list)
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: ProjectStatus = ProjectStatus.COMPLETED


class CertificationItem(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=140)
    issuer: str = Field(..., min_length=2, max_length=100)
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = Field(None, max_length=100)
    credential_url: Optional[str] = None


class CareerPreferences(BaseModel):
    target_roles: List[str] = Field(default_factory=list)
    preferred_industries: List[str] = Field(default_factory=list)
    work_mode: WorkMode = WorkMode.HYBRID
    preferred_locations: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = "Entry-to-Mid"
    preferred_technologies: List[str] = Field(default_factory=list)


class CareerGoals(BaseModel):
    primary_goal: Optional[str] = Field(None, max_length=200)
    goal_timeframe: Optional[str] = Field("12 months", max_length=50)
    additional_goals: List[str] = Field(default_factory=list)


# ====================================================================
# AGGREGATE & INTELLIGENCE SCHEMAS
# ====================================================================

class ProfileCompletionResponse(BaseModel):
    percentage: int = Field(..., ge=0, le=100)
    completed_sections: List[str] = Field(default_factory=list)
    missing_sections: List[str] = Field(default_factory=list)
    section_breakdown: Dict[str, int] = Field(default_factory=dict)
    data_quality_status: str = "Good"  # "Good" | "Needs Attention"
    data_quality_issues: List[str] = Field(default_factory=list)


class CareerReadinessResponse(BaseModel):
    target_career: str = "Not specified yet"
    career_match_score: Optional[int] = None  # None if uncomputed
    verified_skills_count: int = 0
    total_skills_count: int = 0
    priority_gaps_count: int = 0
    roadmap_progress_pct: Optional[int] = None
    resume_ats_score: Optional[int] = None
    is_stale: bool = False
    stale_reason: Optional[str] = None


class ProfileInsightResponse(BaseModel):
    headline: str
    body: str
    action_label: Optional[str] = None
    action_route: Optional[str] = None
    generated_at: str


class ProfileActivityRecord(BaseModel):
    id: str
    action: str
    entity_type: str
    description: str
    timestamp: str


class FullProfileResponse(BaseModel):
    user_id: str
    email: str
    name: str
    personal: PersonalInfoUpdate
    education: List[EducationItem] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    skills: List[SkillItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    preferences: CareerPreferences = Field(default_factory=CareerPreferences)
    goals: CareerGoals = Field(default_factory=CareerGoals)
    completion: ProfileCompletionResponse
    readiness: CareerReadinessResponse
    insight: Optional[ProfileInsightResponse] = None
    updated_at: str
