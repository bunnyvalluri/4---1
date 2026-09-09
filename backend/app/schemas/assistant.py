from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None
    mode: Optional[Literal["standard", "interview", "learning", "quiz", "project", "resume"]] = "standard"


class StructuredActionPayload(BaseModel):
    action_type: str = Field(..., description="Action identifier: OPEN_ROADMAP, OPEN_SKILLS, OPEN_PROJECT, OPEN_RESUME, START_PROJECT, ADD_TO_ROADMAP")
    title: str
    description: Optional[str] = None
    route: Optional[str] = None
    entity_id: Optional[str] = None
    requires_confirmation: bool = False
    parameters: Optional[Dict[str, Any]] = None


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    status: Optional[str] = "COMPLETED"
    actions: Optional[List[StructuredActionPayload]] = None
    sources: Optional[List[str]] = None
    message_metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Consultation"
    mode: Optional[str] = "standard"


class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[Literal["ACTIVE", "ARCHIVED"]] = None


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    status: str = "ACTIVE"
    summary: Optional[str] = None
    message_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_message_at: Optional[str] = None
    messages: List[ChatMessageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CareerContextResponse(BaseModel):
    user_id: str
    user_name: str
    email: str
    target_career: Optional[str] = None
    career_match_score: Optional[int] = None
    top_skill_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    top_skills: List[Dict[str, Any]] = Field(default_factory=list)
    roadmap: Optional[Dict[str, Any]] = None
    active_project: Optional[Dict[str, Any]] = None
    resume_ats_score: Optional[int] = None
    assessment_score: Optional[int] = None
    suggested_prompts: List[str] = Field(default_factory=list)


class ChatActionExecuteRequest(BaseModel):
    action_type: str
    entity_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None


class ChatActionExecuteResponse(BaseModel):
    success: bool
    action_type: str
    message: str
    data: Optional[Dict[str, Any]] = None


class QuickConsultationRequest(BaseModel):
    query: str
    career_focus: Optional[str] = None
