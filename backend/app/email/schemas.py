from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, EmailStr, Field


class EmailDeliveryResult(BaseModel):
    success: bool
    provider: str
    message_id: Optional[str] = None
    recipient: str
    template: str
    subject: str
    error_message: Optional[str] = None
    sent_at: Optional[str] = None


class EmailEventRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    email: str
    template: str
    event_type: str
    subject: str
    provider: str
    status: str = Field("PENDING", description="PENDING, SENT, FAILED")
    provider_message_id: Optional[str] = None
    error_code: Optional[str] = None
    created_at: str
    sent_at: Optional[str] = None
    failed_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
