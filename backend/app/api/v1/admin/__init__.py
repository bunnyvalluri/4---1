from fastapi import APIRouter
from app.api.v1.admin import (
    dashboard,
    candidates,
    careers,
    assessments,
    audit_logs,
    health,
    ai,
    settings,
    analytics,
)

router = APIRouter(prefix="/admin")

router.include_router(dashboard.router)
router.include_router(candidates.router)
router.include_router(careers.router)
router.include_router(assessments.router)
router.include_router(audit_logs.router)
router.include_router(health.router)
router.include_router(ai.router)
router.include_router(settings.router)
router.include_router(analytics.router)

__all__ = ["router"]
