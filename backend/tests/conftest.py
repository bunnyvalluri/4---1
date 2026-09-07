import asyncio
import os
import sys
from typing import AsyncGenerator
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.core.security import create_access_token
from app.models.user import User, Role
from app.core.security import get_password_hash

TEST_DB_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_guidance.db"))
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass
    yield
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def prepare_database():
    # Import all models to register on Base.metadata
    import app.models.user  # noqa: F401
    import app.models.profile  # noqa: F401
    import app.models.education  # noqa: F401
    import app.models.skill  # noqa: F401
    import app.models.career  # noqa: F401
    import app.models.assessment  # noqa: F401
    import app.models.recommendation  # noqa: F401
    import app.models.roadmap  # noqa: F401
    import app.models.project  # noqa: F401
    import app.models.resume  # noqa: F401
    import app.models.chat  # noqa: F401
    import app.models.notification  # noqa: F401

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user() -> User:
    async with TestSessionLocal() as session:
        user = User(
            name="Test Engineer",
            email="testuser@careerai.dev",
            password_hash=get_password_hash("SecretPass123"),
            role=Role.USER,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest.fixture
async def auth_headers(test_user: User) -> dict:
    token = create_access_token(subject=test_user.id, role=test_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_admin() -> User:
    async with TestSessionLocal() as session:
        admin = User(
            name="Admin Lead",
            email="adminlead@careerai.dev",
            password_hash=get_password_hash("AdminPass123"),
            role=Role.ADMIN,
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        return admin


@pytest.fixture
async def admin_auth_headers(test_admin: User) -> dict:
    token = create_access_token(subject=test_admin.id, role=test_admin.role.value)
    return {"Authorization": f"Bearer {token}"}
