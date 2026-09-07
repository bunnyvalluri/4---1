from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class EducationItem(BaseModel):
    id: Optional[str] = None
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = None
    description: Optional[str] = None


class ProfileBase(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    college: Optional[str] = None
    grad_year: Optional[int] = None
    cgpa: Optional[float] = None
    interests: List[str] = Field(default_factory=list)
    preferred_industries: List[str] = Field(default_factory=list)
    preferred_roles: List[str] = Field(default_factory=list)
    preferred_locations: List[str] = Field(default_factory=list)
    career_goals: Optional[str] = None
    work_experience_years: float = 0.0
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    college: Optional[str] = None
    grad_year: Optional[int] = None
    cgpa: Optional[float] = None
    interests: Optional[List[str]] = None
    preferred_industries: Optional[List[str]] = None
    preferred_roles: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    career_goals: Optional[str] = None
    work_experience_years: Optional[float] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
