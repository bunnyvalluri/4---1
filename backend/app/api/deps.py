from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import oauth2_scheme, decode_token
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.models.user import User, Role
from app.repositories.user_repository import UserRepository


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Could not validate credentials.")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise AuthenticationError("User does not exist.")
    return user


async def get_current_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.role != Role.ADMIN:
        raise PermissionDeniedError("Administrative privileges required.")
    return current_user
