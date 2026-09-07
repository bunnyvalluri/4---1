from datetime import datetime
from typing import List, Optional
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

    model_config = ConfigDict(from_attributes=True)


class ProjectFilter(BaseModel):
    career_id: Optional[str] = None
    difficulty: Optional[str] = None
