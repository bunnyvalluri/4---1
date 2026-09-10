from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import firebase_admin
from firebase_admin import firestore
from google.cloud.firestore_v1.client import Client as FirestoreClient
from app.firebase.admin import get_firebase_app
from app.core.logging import logger

_db_client: Optional[FirestoreClient] = None


class FirestoreCollections:
    """Canonical collection identifiers matching the Firestore collection architecture."""
    USERS = "users"
    PROFILES = "profiles"
    EDUCATION = "education"
    EXPERIENCES = "experiences"
    SKILLS = "skills"
    USER_SKILLS = "user_skills"
    INTERESTS = "interests"
    CERTIFICATIONS = "certifications"
    PROJECTS = "projects"
    USER_PROJECTS = "user_projects"
    USER_PROJECT_MILESTONES = "user_project_milestones"
    SAVED_PROJECTS = "saved_projects"
    PROJECT_ACTIVITY = "project_activity"
    PROJECT_EVIDENCE = "project_evidence"
    CAREERS = "careers"
    CAREER_SKILLS = "career_skills"
    ASSESSMENTS = "assessments"
    QUESTIONS = "questions"
    ASSESSMENT_ATTEMPTS = "assessment_attempts"
    ANSWERS = "answers"
    CAREER_RECOMMENDATIONS = "career_recommendations"
    SKILL_GAPS = "skill_gaps"
    ROADMAPS = "roadmaps"
    ROADMAP_ITEMS = "roadmap_items"
    RESUMES = "resumes"
    RESUME_ANALYSES = "resume_analyses"
    CHAT_SESSIONS = "chat_sessions"
    CHAT_MESSAGES = "chat_messages"
    NOTIFICATIONS = "notifications"
    AUDIT_LOGS = "audit_logs"
    EMAIL_EVENTS = "email_events"
    CAREER_PREFERENCES = "career_preferences"
    CAREER_GOALS = "career_goals"
    PROFILE_ACTIVITY = "profile_activity"
    PROFILE_INSIGHTS = "profile_insights"


def get_firestore_client() -> FirestoreClient:
    """Returns the thread-safe Cloud Firestore client instance."""
    global _db_client
    if _db_client is not None:
        return _db_client

    get_firebase_app()
    _db_client = firestore.client()
    return _db_client


def now_utc_iso() -> str:
    """Returns current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


# ==========================================================
# FIRESTORE REPOSITORY HELPERS
# ==========================================================

import uuid

_in_memory_db: Dict[str, Dict[str, Any]] = {}


class FirestoreRepository:
    """Generic Firestore repository providing typed CRUD, batch, and query operations."""
    _memory_db: Dict[str, Dict[str, Any]] = _in_memory_db

    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self._memory_db.setdefault(collection_name, {})
        try:
            self.db = get_firestore_client()
            self.collection = self.db.collection(collection_name)
        except Exception as e:
            logger.warning(f"Could not connect to Firestore client: {e}. Using in-memory fallback store.")
            self.db = None
            self.collection = None

    def get(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves document by ID."""
        if self.collection is not None:
            try:
                doc = self.collection.document(doc_id).get()
                if doc.exists:
                    data = doc.to_dict()
                    data["id"] = doc.id
                    self._memory_db[self.collection_name][doc_id] = dict(data)
                    return data
                return None
            except Exception as e:
                logger.warning(f"Firestore get({self.collection_name}/{doc_id}) fallback to memory: {e}")

        mem_doc = self._memory_db[self.collection_name].get(doc_id)
        return dict(mem_doc) if mem_doc is not None else None

    def set(self, doc_id: str, data: Dict[str, Any], merge: bool = True) -> Dict[str, Any]:
        """Creates or overwrites a document with deterministic ID."""
        data_to_save = dict(data)
        if "updatedAt" not in data_to_save:
            data_to_save["updatedAt"] = now_utc_iso()
        if "createdAt" not in data_to_save:
            data_to_save["createdAt"] = now_utc_iso()
        data_to_save["id"] = doc_id

        target = self._memory_db[self.collection_name]
        if merge and doc_id in target:
            target[doc_id] = {**target[doc_id], **data_to_save}
        else:
            target[doc_id] = dict(data_to_save)

        if self.collection is not None:
            try:
                self.collection.document(doc_id).set(data_to_save, merge=merge)
            except Exception as e:
                logger.warning(f"Firestore set({self.collection_name}/{doc_id}) fallback to memory: {e}")
        return dict(self._memory_db[self.collection_name][doc_id])

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a document with an auto-generated ID."""
        data_to_save = dict(data)
        if "createdAt" not in data_to_save:
            data_to_save["createdAt"] = now_utc_iso()
        if "updatedAt" not in data_to_save:
            data_to_save["updatedAt"] = now_utc_iso()

        doc_id = data_to_save.get("id") or uuid.uuid4().hex
        data_to_save["id"] = doc_id
        self._memory_db[self.collection_name][doc_id] = dict(data_to_save)

        if self.collection is not None:
            try:
                _, doc_ref = self.collection.add(data_to_save)
                data_to_save["id"] = doc_ref.id
                self._memory_db[self.collection_name][doc_ref.id] = dict(data_to_save)
            except Exception as e:
                logger.warning(f"Firestore create({self.collection_name}) fallback to memory: {e}")
        return data_to_save

    def update(self, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates specific fields in a document."""
        data_to_update = dict(data)
        data_to_update["updatedAt"] = now_utc_iso()
        if doc_id in self._memory_db[self.collection_name]:
            self._memory_db[self.collection_name][doc_id].update(data_to_update)
        else:
            self._memory_db[self.collection_name][doc_id] = dict(data_to_update)

        if self.collection is not None:
            try:
                doc_ref = self.collection.document(doc_id)
                doc_ref.update(data_to_update)
                return self.get(doc_id)
            except Exception as e:
                logger.warning(f"Firestore update({self.collection_name}/{doc_id}) fallback to memory: {e}")
        return self._memory_db[self.collection_name].get(doc_id)

    def delete(self, doc_id: str) -> bool:
        """Deletes a document by ID."""
        self._memory_db[self.collection_name].pop(doc_id, None)
        if self.collection is not None:
            try:
                self.collection.document(doc_id).delete()
            except Exception as e:
                logger.warning(f"Firestore delete({self.collection_name}/{doc_id}) fallback to memory: {e}")
        return True

    def query_by_user(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Queries documents owned by user_id."""
        if self.collection is not None:
            try:
                docs = self.collection.where("userId", "==", user_id).limit(limit).stream()
                results = []
                for d in docs:
                    item = d.to_dict()
                    item["id"] = d.id
                    results.append(item)
                return results
            except Exception as e:
                logger.warning(f"Firestore query_by_user({self.collection_name}) fallback to memory: {e}")

        items = [
            dict(v) for v in self._memory_db[self.collection_name].values()
            if v.get("userId") == user_id or v.get("uid") == user_id or v.get("user_id") == user_id
        ]
        return items[:limit]

    def query_by_field(self, field: str, op: str, value: Any, limit: int = 100) -> List[Dict[str, Any]]:
        """Executes a filtered query on the collection."""
        if self.collection is not None:
            try:
                docs = self.collection.where(field, op, value).limit(limit).stream()
                results = []
                for d in docs:
                    item = d.to_dict()
                    item["id"] = d.id
                    results.append(item)
                return results
            except Exception as e:
                logger.warning(f"Firestore query_by_field({self.collection_name}) fallback to memory: {e}")

        items = []
        for v in self._memory_db[self.collection_name].values():
            val = v.get(field)
            match = False
            if op in ("==", "=") and val == value:
                match = True
            elif op == "!=" and val != value:
                match = True
            elif op == "in" and isinstance(value, (list, tuple, set)) and val in value:
                match = True
            elif op == "array-contains" and isinstance(val, (list, tuple, set)) and value in val:
                match = True
            elif op == ">" and val is not None and val > value:
                match = True
            elif op == ">=" and val is not None and val >= value:
                match = True
            elif op == "<" and val is not None and val < value:
                match = True
            elif op == "<=" and val is not None and val <= value:
                match = True
            if match:
                items.append(dict(v))
        return items[:limit]

    def list_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Lists documents up to the specified limit."""
        if self.collection is not None:
            try:
                docs = self.collection.limit(limit).stream()
                results = []
                for d in docs:
                    item = d.to_dict()
                    item["id"] = d.id
                    results.append(item)
                return results
            except Exception as e:
                logger.warning(f"Firestore list_all({self.collection_name}) fallback to memory: {e}")

        return [dict(v) for v in self._memory_db[self.collection_name].values()][:limit]


def record_audit_log(user_id: str, action: str, resource: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    """Records an immutable security audit log entry in the audit_logs collection."""
    try:
        repo = FirestoreRepository(FirestoreCollections.AUDIT_LOGS)
        repo.create({
            "userId": user_id,
            "action": action,
            "resource": resource,
            "metadata": metadata or {},
            "timestamp": now_utc_iso(),
        })
    except Exception as e:
        logger.warning(f"Failed to record audit log: {e}")
