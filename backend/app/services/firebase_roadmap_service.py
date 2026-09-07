from typing import Any, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.ai.roadmap_generator import AIRoadmapGenerator
from app.core.exceptions import PermissionDeniedError, ValidationError


class FirebaseRoadmapService:
    """Manages milestone curricula and checklist tasks in Cloud Firestore."""

    def __init__(self):
        self.roadmaps_repo = FirestoreRepository(FirestoreCollections.ROADMAPS)
        self.items_repo = FirestoreRepository(FirestoreCollections.ROADMAP_ITEMS)
        self.generator = AIRoadmapGenerator()

    async def generate_roadmap(
        self,
        user_id: str,
        career_id: str,
        career_title: str,
        missing_skills: List[str],
        duration_months: int = 6,
    ) -> Dict[str, Any]:
        """Generates a dynamic 6-month roadmap and saves roadmap + roadmap_items to Firestore."""
        doc_id = f"{user_id}_{career_id}"

        roadmap_doc = {
            "userId": user_id,
            "careerId": career_id,
            "careerTitle": career_title,
            "durationMonths": duration_months,
            "completedItemsCount": 0,
            "totalItemsCount": 0,
            "updatedAt": now_utc_iso(),
        }
        self.roadmaps_repo.set(doc_id, roadmap_doc, merge=True)

        generated_items = await self.generator.generate_roadmap_items(
            career_title=career_title,
            missing_skills=missing_skills,
            duration_months=duration_months,
        )

        saved_items = []
        for idx, item in enumerate(generated_items, start=1):
            item_id = f"{doc_id}_month_{idx}"
            item_data = {
                "roadmapId": doc_id,
                "userId": user_id,
                "month": idx,
                "title": item["title"],
                "description": item["description"],
                "tasks": item["tasks"],
                "isCompleted": False,
                "updatedAt": now_utc_iso(),
            }
            saved = self.items_repo.set(item_id, item_data, merge=True)
            saved_items.append(saved)

        self.roadmaps_repo.update(doc_id, {
            "totalItemsCount": len(saved_items),
        })

        record_audit_log(user_id, "ROADMAP_GENERATED", f"roadmaps/{doc_id}")
        return {
            "roadmap": roadmap_doc,
            "items": saved_items,
        }

    def get_roadmap(self, user_id: str, career_id: str) -> Optional[Dict[str, Any]]:
        """Fetches roadmap and milestone checklist items."""
        doc_id = f"{user_id}_{career_id}"
        roadmap = self.roadmaps_repo.get(doc_id)
        if not roadmap:
            return None

        # Cross-user ownership verification
        if roadmap.get("userId") != user_id:
            raise PermissionDeniedError("Cannot access another candidate's roadmap.")

        items = self.items_repo.query_by_field("roadmapId", "==", doc_id)
        items.sort(key=lambda x: x.get("month", 0))
        return {
            "roadmap": roadmap,
            "items": items,
        }

    def update_task_progress(self, user_id: str, item_id: str, task_id: str, completed: bool) -> Dict[str, Any]:
        """Toggles a task within a roadmap item with strict ownership enforcement."""
        item = self.items_repo.get(item_id)
        if not item:
            raise ValidationError(f"Roadmap item {item_id} not found.")

        # Security rule: User must own the item
        if item.get("userId") != user_id:
            raise PermissionDeniedError("Unauthorized: You do not own this roadmap item.")

        tasks = item.get("tasks", [])
        updated_tasks = []
        found = False
        all_completed = True

        for t in tasks:
            if t.get("id") == task_id:
                t["done"] = completed
                found = True
            if not t.get("done", False):
                all_completed = False
            updated_tasks.append(t)

        if not found:
            raise ValidationError(f"Task {task_id} not found in milestone.")

        updated_item = self.items_repo.update(item_id, {
            "tasks": updated_tasks,
            "isCompleted": all_completed,
        })
        record_audit_log(user_id, "ROADMAP_TASK_UPDATED", f"roadmap_items/{item_id}")
        return updated_item
