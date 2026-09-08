import asyncio
import json
from typing import Annotated, Any, Dict
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_admin, FirebaseUserWrapper
from app.models.user import User
from app.services.admin_dashboard_service import AdminDashboardService
from app.core.logging import logger

router = APIRouter(tags=["Admin Dashboard"])


@router.get("/dashboard")
async def get_admin_dashboard(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """
    Returns consolidated real-time admin dashboard metrics and live activity.
    Requires verified administrator authorization.
    """
    service = AdminDashboardService(db)
    metrics = await service.get_dashboard_metrics()
    activity = await service.get_live_activity(limit=12)

    return {
        "metrics": metrics,
        "live_activity": activity,
        "admin_user": {
            "id": admin.id,
            "email": admin.email,
            "name": admin.name,
            "role": "ADMIN",
        },
    }


@router.get("/metrics")
async def get_admin_metrics(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Backwards-compatible endpoint for platform summary counts."""
    service = AdminDashboardService(db)
    metrics = await service.get_dashboard_metrics()
    return metrics


@router.get("/events")
async def stream_admin_events(
    request: Request,
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Server-Sent Events (SSE) stream for real-time live platform activity and metrics updates.
    """
    async def event_generator():
        service = AdminDashboardService(db)
        while True:
            if await request.is_disconnected():
                break
            try:
                metrics = await service.get_dashboard_metrics()
                activity = await service.get_live_activity(limit=6)
                payload = json.dumps({
                    "metrics": metrics,
                    "recent_activity": activity,
                })
                yield f"data: {payload}\n\n"
            except Exception as e:
                logger.debug(f"SSE stream heartbeat err: {e}")
            await asyncio.sleep(10)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
