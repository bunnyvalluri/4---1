from typing import Annotated, Any, Dict
from fastapi import APIRouter, Depends
from app.api.deps import get_current_admin, FirebaseUserWrapper
from app.models.user import User
from app.services.admin_health_service import AdminHealthService

router = APIRouter(tags=["Admin Health"])


@router.get("/health")
@router.get("/system/health")
async def get_system_health(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
) -> Dict[str, Any]:
    """Runs live health diagnostics across API, Firebase, Firestore, Storage, and AI services."""
    return await AdminHealthService.check_all_systems()
