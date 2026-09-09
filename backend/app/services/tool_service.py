import uuid
from typing import Any, Dict, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.core.exceptions import ValidationError, PermissionDeniedError, EntityNotFoundError
from app.core.logging import logger


class ToolService:
    """
    Controlled execution service for write and navigation actions suggested
    by the AI Career Mentor. Validates permissions, enforces business logic,
    and updates Firestore deterministically.
    """

    def __init__(self):
        self.user_projects_repo = FirestoreRepository(FirestoreCollections.USER_PROJECTS)
        self.projects_repo = FirestoreRepository(FirestoreCollections.PROJECTS)
        self.roadmaps_repo = FirestoreRepository(FirestoreCollections.ROADMAPS)
        self.roadmap_items_repo = FirestoreRepository(FirestoreCollections.ROADMAP_ITEMS)
        self.profiles_repo = FirestoreRepository(FirestoreCollections.PROFILES)
        self.notifications_repo = FirestoreRepository(FirestoreCollections.NOTIFICATIONS)

    async def execute_action(
        self,
        user_id: str,
        action_type: str,
        entity_id: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        params = parameters or {}
        action = action_type.upper()

        if action == "START_PROJECT":
            return await self._start_project(user_id, entity_id, params)
        elif action == "ADD_TO_ROADMAP":
            return await self._add_to_roadmap(user_id, entity_id, params)
        elif action == "UPDATE_CAREER_GOAL":
            return await self._update_career_goal(user_id, params)
        elif action in ["OPEN_ROADMAP", "OPEN_SKILLS", "OPEN_PROJECT", "OPEN_RESUME", "OPEN_RECOMMENDATIONS"]:
            return {
                "success": True,
                "action_type": action,
                "message": f"Navigating to {action.lower().replace('open_', '')}",
                "data": {"route": self._get_route_for_action(action, entity_id)},
            }
        else:
            raise ValidationError(f"Unsupported action type: {action_type}")

    async def _start_project(self, user_id: str, project_id: Optional[str], params: Dict[str, Any]) -> Dict[str, Any]:
        target_project_id = project_id or params.get("projectId")
        if not target_project_id:
            raise ValidationError("Target project ID is required to start a project.")

        # Check existing user project
        existing_list = self.user_projects_repo.query_by_user(user_id, limit=20)
        user_proj = next((p for p in existing_list if p.get("projectId") == target_project_id), None)

        title = params.get("title")
        if not title:
            catalog_proj = self.projects_repo.get(target_project_id)
            title = catalog_proj.get("title") if catalog_proj else "Capstone Applied Project"

        if user_proj:
            doc_id = user_proj["id"]
            self.user_projects_repo.update(doc_id, {
                "status": "IN_PROGRESS",
                "startedAt": now_utc_iso(),
            })
        else:
            doc_id = uuid.uuid4().hex
            self.user_projects_repo.set(doc_id, {
                "userId": user_id,
                "projectId": target_project_id,
                "title": title,
                "status": "IN_PROGRESS",
                "progressPercent": 0,
                "currentMilestone": "Architecture Setup & Scaffolding",
                "startedAt": now_utc_iso(),
                "createdAt": now_utc_iso(),
            })

        # Create user notification
        self.notifications_repo.create({
            "userId": user_id,
            "title": "Project Initiated",
            "message": f"Successfully started '{title}'. Track your milestone progress on the Projects page.",
            "type": "PROJECT_STARTED",
            "read": False,
            "createdAt": now_utc_iso(),
        })

        record_audit_log(user_id, "AI_ACTION_START_PROJECT", f"projects/{target_project_id}", {"title": title})

        return {
            "success": True,
            "action_type": "START_PROJECT",
            "message": f"Successfully activated project: '{title}'.",
            "data": {
                "projectId": target_project_id,
                "userProjectId": doc_id,
                "title": title,
                "route": "/projects",
            },
        }

    async def _add_to_roadmap(self, user_id: str, roadmap_id: Optional[str], params: Dict[str, Any]) -> Dict[str, Any]:
        milestone_title = params.get("title") or params.get("milestone_title")
        if not milestone_title:
            raise ValidationError("Milestone title is required to add an item to the roadmap.")

        # Find user active roadmap
        roadmaps = self.roadmaps_repo.query_by_user(user_id, limit=5)
        active_roadmap = next((r for r in roadmaps if r.get("status") == "ACTIVE"), None)
        if not active_roadmap and roadmaps:
            active_roadmap = roadmaps[0]

        if not active_roadmap:
            raise ValidationError("No active roadmap found to add milestone to. Please generate a roadmap first.")

        target_roadmap_id = active_roadmap["id"]
        item_id = uuid.uuid4().hex

        new_item = {
            "userId": user_id,
            "roadmapId": target_roadmap_id,
            "title": milestone_title,
            "description": params.get("description", f"AI Mentor recommended milestone: {milestone_title}"),
            "status": "NOT_STARTED",
            "isCompleted": False,
            "month": params.get("month", 1),
            "estimatedHours": params.get("estimatedHours", 8),
            "createdAt": now_utc_iso(),
        }

        self.roadmap_items_repo.set(item_id, new_item)

        # Notify user
        self.notifications_repo.create({
            "userId": user_id,
            "title": "Roadmap Milestone Added",
            "message": f"Added '{milestone_title}' to your learning roadmap.",
            "type": "ROADMAP_UPDATED",
            "read": False,
            "createdAt": now_utc_iso(),
        })

        record_audit_log(user_id, "AI_ACTION_ADD_ROADMAP_ITEM", f"roadmap_items/{item_id}", {"title": milestone_title})

        return {
            "success": True,
            "action_type": "ADD_TO_ROADMAP",
            "message": f"Successfully added milestone '{milestone_title}' to your active roadmap.",
            "data": {
                "itemId": item_id,
                "roadmapId": target_roadmap_id,
                "title": milestone_title,
                "route": "/roadmap",
            },
        }

    async def _update_career_goal(self, user_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        new_goal = params.get("careerGoal") or params.get("targetCareer")
        if not new_goal:
            raise ValidationError("Target career goal must be provided.")

        self.profiles_repo.update(user_id, {
            "careerGoals": new_goal,
            "targetRole": new_goal,
        })

        record_audit_log(user_id, "AI_ACTION_UPDATE_CAREER_GOAL", f"profiles/{user_id}", {"careerGoal": new_goal})

        return {
            "success": True,
            "action_type": "UPDATE_CAREER_GOAL",
            "message": f"Updated career focus to '{new_goal}'.",
            "data": {"careerGoal": new_goal, "route": "/profile"},
        }

    def _get_route_for_action(self, action: str, entity_id: Optional[str] = None) -> str:
        routes = {
            "OPEN_ROADMAP": "/roadmap",
            "OPEN_SKILLS": "/skills",
            "OPEN_PROJECT": f"/projects?id={entity_id}" if entity_id else "/projects",
            "OPEN_RESUME": "/resume",
            "OPEN_RECOMMENDATIONS": "/recommendations",
        }
        return routes.get(action, "/dashboard")


tool_service = ToolService()
