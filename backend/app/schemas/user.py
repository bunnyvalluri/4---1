from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import Role


class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Optional[Role] = Role.USER


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[Role] = None


class UserResponse(UserBase):
    id: str
    role: Role
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
