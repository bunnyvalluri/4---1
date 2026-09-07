from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserResponse
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    req: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AuthService(db)
    return await service.register(req)


@router.post("/login", response_model=Token)
async def login(
    req: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AuthService(db)
    return await service.login(req)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user
