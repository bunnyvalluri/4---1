from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    message_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class QuickConsultationRequest(BaseModel):
    query: str
    career_focus: Optional[str] = None
