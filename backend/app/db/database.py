from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
from app.db.base import Base

# Engine configuration
connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an asynchronous database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables in the database if they do not exist."""
    # Import all models to ensure metadata registration
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

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
