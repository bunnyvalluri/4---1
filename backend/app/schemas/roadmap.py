from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class RoadmapTaskItem(BaseModel):
    id: str
    text: str
    done: bool = False


class RoadmapItemResponse(BaseModel):
    id: str
    month: int
    title: str
    description: str
    skills: List[str]
    tasks: List[Dict[str, Any]]
    is_completed: bool
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RoadmapGenerateRequest(BaseModel):
    career_id: str
    duration_months: Optional[int] = 6


class RoadmapItemUpdate(BaseModel):
    is_completed: Optional[bool] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    career_id: str
    title: str
    description: str
    duration_months: int
    progress_percent: float
    status: str
    items: List[RoadmapItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
