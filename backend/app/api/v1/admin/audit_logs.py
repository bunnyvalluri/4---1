from typing import Annotated, Any, Dict, List
from fastapi import APIRouter, Depends, Query
from app.api.deps import get_current_admin, FirebaseUserWrapper
from app.models.user import User
from app.services.admin_audit_service import AdminAuditService

router = APIRouter(prefix="/audit-logs", tags=["Admin Audit Logs"])


@router.get("")
async def list_audit_logs(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    limit: int = Query(50, ge=1, le=200),
) -> List[Dict[str, Any]]:
    """Retrieves immutable administrative audit trail."""
    service = AdminAuditService()
    return service.list_audit_logs(limit=limit)
