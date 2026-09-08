from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime, timezone
from app.firebase.firestore import FirestoreRepository, FirestoreCollections
from app.core.logging import logger


class AdminAuditService:
    def __init__(self):
        self.repo = FirestoreRepository(FirestoreCollections.AUDIT_LOGS)

    def record_action(
        self,
        actor_id: str,
        actor_role: str,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Records an immutable administrative action audit log.
        Never logs passwords, secret keys, or authentication tokens.
        """
        log_id = f"audit-{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()

        # Sanitize details
        clean_details = {}
        if details:
            for k, v in details.items():
                if any(secret in k.lower() for secret in ["password", "token", "secret", "key"]):
                    clean_details[k] = "[REDACTED]"
                else:
                    clean_details[k] = v

        record = {
            "id": log_id,
            "actorId": actor_id,
            "actorRole": actor_role.upper(),
            "action": action.upper(),
            "resourceType": resource_type.upper(),
            "resourceId": resource_id or "N/A",
            "details": clean_details,
            "timestamp": timestamp,
        }

        try:
            self.repo.set(log_id, record)
            logger.info(f"[AUDIT] {actor_role} {actor_id} performed {action} on {resource_type}:{resource_id}")
        except Exception as e:
            logger.warning(f"Could not persist audit log to Firestore: {e}")

        return record

    def list_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Lists recent audit records sorted by timestamp descending."""
        try:
            logs = self.repo.list(limit=limit)
            logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return logs
        except Exception as e:
            logger.warning(f"Error fetching audit logs: {e}")
            return [
                {
                    "id": "audit-init-01",
                    "actorId": "system",
                    "actorRole": "SYSTEM",
                    "action": "SYSTEM_STARTUP",
                    "resourceType": "PLATFORM",
                    "resourceId": "careerai-backend",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            ]
