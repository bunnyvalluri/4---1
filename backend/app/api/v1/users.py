from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_current_admin)],
    skip: int = 0,
    limit: int = 50,
):
    repo = UserRepository(db)
    return await repo.list_users(skip=skip, limit=limit)


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if update_data.name is not None:
        current_user.name = update_data.name
    if update_data.avatar is not None:
        current_user.avatar = update_data.avatar
    repo = UserRepository(db)
    return await repo.update(current_user)
