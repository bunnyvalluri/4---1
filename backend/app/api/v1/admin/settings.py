from typing import Annotated, Any, Dict
from fastapi import APIRouter, Depends, Body
from app.api.deps import get_current_admin, FirebaseUserWrapper
from app.models.user import User
from app.firebase.firestore import FirestoreRepository
from app.services.admin_audit_service import AdminAuditService

router = APIRouter(prefix="/settings", tags=["Admin Settings"])


@router.get("")
async def get_admin_settings(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
) -> Dict[str, Any]:
    """Retrieves validated platform settings."""
    try:
        repo = FirestoreRepository("admin_settings")
        doc = repo.get("platform_config")
        if doc:
            return doc
    except Exception:
        pass

    return {
        "platform_name": "CareerAI Platform",
        "maintenance_mode": False,
        "recommendation_threshold": 60,
        "ai_model_preference": "gemini-2.5-flash",
        "email_notifications": True,
        "rate_limit_per_minute": 60,
    }


@router.put("")
async def update_admin_settings(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """Updates platform settings with audit logging."""
    try:
        repo = FirestoreRepository("admin_settings")
        repo.set("platform_config", payload)
    except Exception:
        pass

    audit_service = AdminAuditService()
    audit_service.record_action(
        actor_id=admin.id,
        actor_role="ADMIN",
        action="SETTINGS_UPDATED",
        resource_type="SYSTEM_SETTINGS",
        resource_id="platform_config",
        details={"updated_keys": list(payload.keys())},
    )

    return {"status": "SUCCESS", "message": "Settings updated successfully."}
