from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import AuthenticationError, ConflictError, EntityNotFoundError
from app.models.user import User, Role
from app.models.profile import Profile
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, Token


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register(self, req: RegisterRequest) -> Token:
        existing = await self.user_repo.get_by_email(req.email)
        if existing:
            raise ConflictError("An account with this email address already exists.")

        user = User(
            name=req.name,
            email=req.email,
            password_hash=get_password_hash(req.password),
            role=Role.USER,
        )
        await self.user_repo.create(user)

        # Create initial empty profile for the new user
        profile = Profile(
            user_id=user.id,
            interests=[],
            preferred_industries=[],
            preferred_roles=[],
            preferred_locations=[],
        )
        self.session.add(profile)
        await self.session.flush()

        token_str = create_access_token(subject=user.id, role=user.role.value)
        return Token(
            access_token=token_str,
            role=user.role.value,
            user_id=user.id,
            name=user.name,
            email=user.email,
        )

    async def login(self, req: LoginRequest) -> Token:
        user = await self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.password_hash):
            raise AuthenticationError("Invalid email or password.")

        token_str = create_access_token(subject=user.id, role=user.role.value)
        return Token(
            access_token=token_str,
            role=user.role.value,
            user_id=user.id,
            name=user.name,
            email=user.email,
        )

    async def get_current_user(self, user_id: str) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundError("User", user_id)
        return user
