import asyncio
from app.core.logging import logger


async def background_log_user_activity(user_id: str, action: str, details: dict = None) -> None:
    """Asynchronous background worker task to log telemetry/user events."""
    logger.info(f"[Activity Log] User: {user_id} performed '{action}' with details: {details or {}}")


async def background_refresh_recommendations(user_id: str) -> None:
    """Background task to recalculate career recommendations asynchronously."""
    logger.info(f"[Background Task] Triggering recommendation recalculation for user {user_id}")
    # Simulated background task completion
    await asyncio.sleep(0.1)
    logger.info(f"[Background Task] Recommendation recalculation finished for user {user_id}")
