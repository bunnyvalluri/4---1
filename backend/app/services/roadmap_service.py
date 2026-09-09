import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import EntityNotFoundError, ValidationError, PermissionDeniedError
from app.core.logging import logger
from app.models.roadmap import Roadmap, RoadmapItem
from app.models.career import Career, CareerSkill
from app.models.skill import Skill, UserSkill
from app.models.recommendation import CareerRecommendation, SkillGap
from app.models.assessment import AptitudeAttempt, AssessmentAttemptStatus
from app.models.resume import ResumeAnalysis
from app.repositories.roadmap_repository import RoadmapRepository
from app.repositories.career_repository import CareerRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.ai.roadmap_generator import ai_roadmap_generator
from app.schemas.roadmap import (
    RoadmapResponse,
    RoadmapPhaseResponse,
    RoadmapItemResponse,
    RoadmapItemUpdate,
    RoadmapSettingsUpdate,
    RoadmapRegenerateRequest,
    RoadmapProgressResponse,
    NextBestActionResponse,
    CareerReadinessBreakdown,
    RoadmapIntelligenceInfo,
    RoadmapResourceLink,
)
from app.firebase.firestore import (
    FirestoreRepository,
    FirestoreCollections,
    now_utc_iso,
    record_audit_log,
)


class RoadmapService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.roadmap_repo = RoadmapRepository(session)
        self.career_repo = CareerRepository(session)
        self.rec_repo = RecommendationRepository(session)
        self.roadmaps_firestore = FirestoreRepository(FirestoreCollections.ROADMAPS)
        self.notifications_firestore = FirestoreRepository(FirestoreCollections.NOTIFICATIONS)
        self.user_skills_firestore = FirestoreRepository(FirestoreCollections.USER_SKILLS)

    async def get_or_generate_roadmap(
        self,
        user_id: str,
        career_id: Optional[str] = None,
        duration_months: int = 6,
        hours_per_week: int = 10,
        learning_pace: str = "balanced",
    ) -> RoadmapResponse:
        """
        Retrieves active roadmap for the candidate, or generates an explainable,
        multi-phase curriculum grounded in real profile, assessment, skill gaps, and resume evidence.
        """
        # 1. If career_id specified, check for existing roadmap
        if career_id:
            existing = await self.roadmap_repo.get_by_user_and_career(user_id, career_id)
            if existing and existing.status == "ACTIVE":
                return await self._format_roadmap_response(existing)
        else:
            active = await self.roadmap_repo.get_active_by_user(user_id)
            if active:
                return await self._format_roadmap_response(active)

        # 2. Resolve target career
        target_career: Optional[Career] = None
        if career_id:
            target_career = await self.career_repo.get_by_id(career_id)
            if not target_career:
                raise EntityNotFoundError("Career", career_id)
        else:
            # Look up top recommendation
            stmt_rec = (
                select(CareerRecommendation)
                .where(CareerRecommendation.user_id == user_id)
                .options(selectinload(CareerRecommendation.career))
                .order_by(CareerRecommendation.match_score.desc())
            )
            top_rec = (await self.session.execute(stmt_rec)).scalars().first()
            if top_rec and top_rec.career:
                target_career = top_rec.career
            else:
                # Pick first career from database or fallback
                stmt_c = select(Career).limit(1)
                target_career = (await self.session.execute(stmt_c)).scalars().first()
                if not target_career:
                    raise ValidationError("No target career available to generate roadmap. Complete profile or select career.")

        # 3. Gather real user skills and skill gaps
        stmt_us = select(UserSkill).where(UserSkill.user_id == user_id).options(selectinload(UserSkill.skill))
        user_skills = list((await self.session.execute(stmt_us)).scalars().all())
        verified_skill_names = [us.skill.name for us in user_skills if us.skill and us.verified]

        # Gather skill gaps for target career
        stmt_gaps = (
            select(SkillGap)
            .where(SkillGap.user_id == user_id, SkillGap.career_id == target_career.id)
            .options(selectinload(SkillGap.skill))
            .order_by(SkillGap.priority.asc())
        )
        gaps = list((await self.session.execute(stmt_gaps)).scalars().all())
        missing_skills = [g.skill.name for g in gaps if g.skill]

        if not missing_skills:
            # Fallback to career required skills not possessed
            stmt_cs = (
                select(CareerSkill)
                .where(CareerSkill.career_id == target_career.id)
                .options(selectinload(CareerSkill.skill))
            )
            career_skills = list((await self.session.execute(stmt_cs)).scalars().all())
            have_skill_names = {us.skill.name.lower() for us in user_skills if us.skill}
            missing_skills = [cs.skill.name for cs in career_skills if cs.skill and cs.skill.name.lower() not in have_skill_names]

        # 4. Generate structured curriculum
        curriculum = await ai_roadmap_generator.generate_curriculum(
            career_title=target_career.title,
            missing_skills=missing_skills,
            duration_months=duration_months,
            hours_per_week=hours_per_week,
            learning_pace=learning_pace,
        )

        # 5. Archive any previous active roadmap for this career or user
        stmt_prev = select(Roadmap).where(Roadmap.user_id == user_id, Roadmap.status == "ACTIVE")
        prev_roadmaps = list((await self.session.execute(stmt_prev)).scalars().all())
        for pr in prev_roadmaps:
            if pr.career_id == target_career.id:
                pr.status = "ARCHIVED"

        # Calculate estimated completion date
        total_hours = sum(item["estimated_hours"] for item in curriculum["items"])
        weeks_needed = total_hours / max(1, hours_per_week)
        est_completion = (datetime.now(timezone.utc) + timedelta(days=int(weeks_needed * 7))).strftime("%Y-%m-%d")

        # 6. Build Roadmap record
        new_roadmap = Roadmap(
            user_id=user_id,
            career_id=target_career.id,
            title=f"Path to {target_career.title}",
            description=f"Personalized {duration_months}-month mastery roadmap targeting critical skill gaps and production hiring bars.",
            duration_months=duration_months,
            progress_percent=0.0,
            status="ACTIVE",
            version=1,
            hours_per_week=hours_per_week,
            learning_pace=learning_pace,
            career_readiness_score=0.0,
            readiness_breakdown={},
            roadmap_intelligence={
                "verified_skills_count": len(verified_skill_names),
                "skill_gaps_count": len(missing_skills),
                "assessment_fit_pct": 0.0,
                "resume_points_count": 0,
                "target_career": target_career.title,
            },
            estimated_total_hours=total_hours,
            completed_hours=0.0,
            estimated_completion_date=est_completion,
            phases=curriculum["phases"],
            milestones=curriculum["milestones"],
        )
        self.session.add(new_roadmap)
        await self.session.flush()

        # 7. Add RoadmapItems
        for item_dict in curriculum["items"]:
            r_item = RoadmapItem(
                id=item_dict["id"],
                roadmap_id=new_roadmap.id,
                month=item_dict["month"],
                phase_id=item_dict["phase_id"],
                title=item_dict["title"],
                description=item_dict["description"],
                item_type=item_dict["item_type"],
                priority=item_dict["priority"],
                status=item_dict["status"],
                skills=item_dict["skills"],
                tasks=item_dict["tasks"],
                estimated_hours=item_dict["estimated_hours"],
                actual_hours=0.0,
                item_order=item_dict["item_order"],
                dependencies=item_dict["dependencies"],
                resource_links=item_dict["resource_links"],
                project_id=item_dict["project_id"],
                is_completed=False,
                notes="",
            )
            self.session.add(r_item)

        await self.session.flush()

        # 8. Compute Career Readiness Breakdown
        readiness_score, breakdown = await self.calculate_career_readiness(user_id, target_career.id, 0.0)
        new_roadmap.career_readiness_score = readiness_score
        new_roadmap.readiness_breakdown = breakdown

        await self.session.flush()

        # 9. Sync to Firestore & Notification
        reloaded = await self.roadmap_repo.get_by_id(new_roadmap.id)
        if reloaded:
            await self._sync_to_firestore(reloaded)
            self._emit_notification(
                user_id=user_id,
                title="Roadmap Generated",
                message=f"Your personalized career roadmap for {target_career.title} has been generated.",
                link="/roadmap",
            )
            record_audit_log(user_id, "ROADMAP_GENERATED", f"roadmap:{new_roadmap.id}", {"career": target_career.title})

        return await self._format_roadmap_response(reloaded or new_roadmap)

    async def get_active_roadmap(self, user_id: str) -> Optional[RoadmapResponse]:
        """Retrieves candidate's currently active roadmap."""
        active = await self.roadmap_repo.get_active_by_user(user_id)
        if not active:
            return None
        return await self._format_roadmap_response(active)

    async def get_roadmap_by_id(self, user_id: str, roadmap_id: str) -> RoadmapResponse:
        """Retrieves roadmap by ID with security verification."""
        roadmap = await self.roadmap_repo.get_by_id(roadmap_id)
        if not roadmap:
            raise EntityNotFoundError("Roadmap", roadmap_id)
        if roadmap.user_id != user_id:
            raise PermissionDeniedError("You do not own this roadmap.")
        return await self._format_roadmap_response(roadmap)

    async def get_roadmap_progress(self, user_id: str, roadmap_id: str) -> RoadmapProgressResponse:
        """Returns lightweight telemetry for the roadmap."""
        roadmap = await self.roadmap_repo.get_by_id(roadmap_id)
        if not roadmap or roadmap.user_id != user_id:
            raise EntityNotFoundError("Roadmap", roadmap_id)

        items = roadmap.items or []
        completed_items = [i for i in items if i.is_completed]
        next_action = self.calculate_next_best_action(roadmap)

        active_phase_id = "phase_1"
        for p in (roadmap.phases or []):
            if p.get("progress_percent", 0.0) < 100.0:
                active_phase_id = p.get("id", "phase_1")
                break

        return RoadmapProgressResponse(
            roadmap_id=roadmap.id,
            overall_progress=roadmap.progress_percent,
            career_readiness_score=roadmap.career_readiness_score,
            completed_hours=roadmap.completed_hours,
            total_hours=roadmap.estimated_total_hours,
            completed_items=len(completed_items),
            total_items=len(items),
            active_phase_id=active_phase_id,
            next_best_action=next_action,
        )

    async def start_roadmap_item(self, user_id: str, item_id: str) -> RoadmapItemResponse:
        """
        Transitions item to IN_PROGRESS after verifying dependency prerequisites.
        """
        item = await self.roadmap_repo.get_item_with_roadmap(item_id)
        if not item or not item.roadmap:
            raise EntityNotFoundError("RoadmapItem", item_id)
        if item.roadmap.user_id != user_id:
            raise PermissionDeniedError("Unauthorized access to roadmap item.")

        # Dependency check
        if item.dependencies:
            all_items = {i.id: i for i in item.roadmap.items}
            for dep_id in item.dependencies:
                dep_item = all_items.get(dep_id)
                if dep_item and not dep_item.is_completed and dep_item.status != "SKIPPED":
                    raise ValidationError(
                        f"Prerequisite milestone '{dep_item.title}' must be completed before starting this item.",
                        status_code=422,
                    )

        item.status = "IN_PROGRESS"
        item.started_at = datetime.now(timezone.utc)
        await self.roadmap_repo.update_item(item)

        await self._sync_to_firestore(item.roadmap)
        record_audit_log(user_id, "ROADMAP_ITEM_STARTED", f"item:{item.id}", {"title": item.title})

        return RoadmapItemResponse.model_validate(item)

    async def complete_roadmap_item(self, user_id: str, item_id: str) -> RoadmapItemResponse:
        """
        Authoritative transactional completion workflow:
        1. Dependency check
        2. Status & completed_at update
        3. Downstream prerequisite unlocking
        4. Verified skill evidence update
        5. Skill gap reduction
        6. Overall & phase progress recalculation
        7. Career readiness recalculation
        8. Real-time Firestore sync & notification
        """
        item = await self.roadmap_repo.get_item_with_roadmap(item_id)
        if not item or not item.roadmap:
            raise EntityNotFoundError("RoadmapItem", item_id)
        if item.roadmap.user_id != user_id:
            raise PermissionDeniedError("Unauthorized access to roadmap item.")

        roadmap = item.roadmap
        all_items = {i.id: i for i in roadmap.items}

        # Verify dependencies
        if item.dependencies:
            for dep_id in item.dependencies:
                dep_item = all_items.get(dep_id)
                if dep_item and not dep_item.is_completed and dep_item.status != "SKIPPED":
                    raise ValidationError(
                        f"Cannot complete locked item. Prerequisite '{dep_item.title}' is not complete."
                    )

        # Mark item completed
        item.is_completed = True
        item.status = "COMPLETED"
        item.completed_at = datetime.now(timezone.utc)
        item.actual_hours = item.estimated_hours

        # Mark all internal tasks done
        if item.tasks:
            updated_tasks = []
            for t in item.tasks:
                updated_tasks.append({**t, "done": True})
            item.tasks = updated_tasks

        # Unlock downstream items that depended on this item
        for other_item in roadmap.items:
            if other_item.id != item.id and item.id in (other_item.dependencies or []):
                # Check if all other dependencies are also satisfied
                deps_satisfied = True
                for d_id in other_item.dependencies:
                    if d_id == item.id:
                        continue
                    d_item = all_items.get(d_id)
                    if not d_item or (not d_item.is_completed and d_item.status != "SKIPPED"):
                        deps_satisfied = False
                        break
                if deps_satisfied and other_item.status == "LOCKED":
                    other_item.status = "NOT_STARTED"

        # Update verified skill evidence
        await self._update_skill_evidence(user_id, roadmap.career_id, item.skills or [])

        # Recalculate roadmap overall progress
        completed_count = sum(1 for i in roadmap.items if i.is_completed)
        total_count = len(roadmap.items)
        roadmap.progress_percent = round((completed_count / total_count) * 100.0, 1) if total_count else 100.0
        roadmap.completed_hours = round(sum(i.actual_hours for i in roadmap.items if i.is_completed), 1)

        if roadmap.progress_percent >= 100.0:
            roadmap.status = "COMPLETED"

        # Recalculate phases
        updated_phases = []
        for phase in (roadmap.phases or []):
            phase_id = phase.get("id")
            phase_items = [i for i in roadmap.items if i.phase_id == phase_id]
            phase_done = sum(1 for i in phase_items if i.is_completed)
            phase_pct = round((phase_done / len(phase_items)) * 100.0, 1) if phase_items else 0.0
            updated_phases.append({
                **phase,
                "progress_percent": phase_pct,
                "completed_items_count": phase_done,
                "items_count": len(phase_items),
                "status": "COMPLETED" if phase_pct >= 100.0 else ("IN_PROGRESS" if phase_pct > 0 else phase.get("status", "NOT_STARTED")),
            })
        roadmap.phases = updated_phases

        # Recalculate Career Readiness Score
        readiness_score, breakdown = await self.calculate_career_readiness(
            user_id, roadmap.career_id, roadmap.progress_percent
        )
        roadmap.career_readiness_score = readiness_score
        roadmap.readiness_breakdown = breakdown

        await self.session.flush()

        # Real-time Firestore sync & Audit Log
        await self._sync_to_firestore(roadmap)
        self._emit_notification(
            user_id=user_id,
            title="Milestone Completed",
            message=f"Completed '{item.title}'. Career readiness increased to {readiness_score}%.",
            link="/roadmap",
        )
        record_audit_log(user_id, "ROADMAP_ITEM_COMPLETED", f"item:{item.id}", {
            "title": item.title,
            "readiness": readiness_score,
            "progress": roadmap.progress_percent,
        })

        return RoadmapItemResponse.model_validate(item)

    async def skip_roadmap_item(self, user_id: str, item_id: str) -> RoadmapItemResponse:
        """Safely marks a non-essential item as skipped and unlocks dependencies."""
        item = await self.roadmap_repo.get_item_with_roadmap(item_id)
        if not item or not item.roadmap:
            raise EntityNotFoundError("RoadmapItem", item_id)
        if item.roadmap.user_id != user_id:
            raise PermissionDeniedError("Unauthorized access to roadmap item.")

        item.status = "SKIPPED"
        await self.roadmap_repo.update_item(item)

        # Unlock downstream
        roadmap = item.roadmap
        all_items = {i.id: i for i in roadmap.items}
        for other_item in roadmap.items:
            if other_item.id != item.id and item.id in (other_item.dependencies or []):
                deps_satisfied = True
                for d_id in other_item.dependencies:
                    if d_id == item.id:
                        continue
                    d_item = all_items.get(d_id)
                    if not d_item or (not d_item.is_completed and d_item.status != "SKIPPED"):
                        deps_satisfied = False
                        break
                if deps_satisfied and other_item.status == "LOCKED":
                    other_item.status = "NOT_STARTED"

        await self.session.flush()
        await self._sync_to_firestore(roadmap)
        return RoadmapItemResponse.model_validate(item)

    async def complete_resource(self, user_id: str, item_id: str, resource_id: str) -> RoadmapItemResponse:
        """Marks an external curated resource link as consumed/completed."""
        item = await self.roadmap_repo.get_item_with_roadmap(item_id)
        if not item or not item.roadmap:
            raise EntityNotFoundError("RoadmapItem", item_id)
        if item.roadmap.user_id != user_id:
            raise PermissionDeniedError("Unauthorized access to roadmap item.")

        updated_resources = []
        for r in (item.resource_links or []):
            if r.get("id") == resource_id or r.get("url") == resource_id:
                updated_resources.append({**r, "is_completed": True})
            else:
                updated_resources.append(r)

        item.resource_links = updated_resources
        await self.roadmap_repo.update_item(item)
        await self._sync_to_firestore(item.roadmap)

        return RoadmapItemResponse.model_validate(item)

    async def update_settings(self, user_id: str, roadmap_id: str, settings: RoadmapSettingsUpdate) -> RoadmapResponse:
        """Updates hours per week and pace, recalculating completion timeline."""
        roadmap = await self.roadmap_repo.get_by_id(roadmap_id)
        if not roadmap or roadmap.user_id != user_id:
            raise EntityNotFoundError("Roadmap", roadmap_id)

        if settings.hours_per_week:
            roadmap.hours_per_week = settings.hours_per_week
        if settings.learning_pace:
            roadmap.learning_pace = settings.learning_pace

        # Recalculate completion date based on remaining hours
        uncompleted_hours = sum(i.estimated_hours for i in (roadmap.items or []) if not i.is_completed)
        remaining_weeks = uncompleted_hours / max(1, roadmap.hours_per_week)
        roadmap.estimated_completion_date = (
            datetime.now(timezone.utc) + timedelta(days=int(remaining_weeks * 7))
        ).strftime("%Y-%m-%d")

        await self.session.flush()
        await self._sync_to_firestore(roadmap)
        return await self._format_roadmap_response(roadmap)

    async def regenerate_roadmap(self, user_id: str, roadmap_id: str, req: RoadmapRegenerateRequest) -> RoadmapResponse:
        """
        Archives current roadmap version snapshot to Firestore and rebuilds
        a brand new version (v2, v3) in-place calibrated to latest skill evidence.
        """
        current = await self.roadmap_repo.get_by_id(roadmap_id)
        if not current or current.user_id != user_id:
            raise EntityNotFoundError("Roadmap", roadmap_id)

        target_career_id = req.career_id or current.career_id
        target_career = await self.career_repo.get_by_id(target_career_id)
        if not target_career:
            raise EntityNotFoundError("Career", target_career_id)

        # Snapshot old version in Firestore
        try:
            self.roadmaps_firestore.set(
                f"{current.id}_v{current.version}",
                {
                    "roadmapId": current.id,
                    "version": current.version,
                    "userId": user_id,
                    "careerTitle": current.career.title if current.career else target_career.title,
                    "progressPercent": current.progress_percent,
                    "careerReadinessScore": current.career_readiness_score,
                    "archivedAt": now_utc_iso(),
                    "reason": req.reason or "Curriculum recalibration",
                },
            )
        except Exception as e:
            logger.warning(f"Failed to archive roadmap version: {e}")

        # Gather real user skills and skill gaps
        stmt_us = select(UserSkill).where(UserSkill.user_id == user_id).options(selectinload(UserSkill.skill))
        user_skills = list((await self.session.execute(stmt_us)).scalars().all())
        verified_skill_names = [us.skill.name for us in user_skills if us.skill and us.verified]

        stmt_gaps = (
            select(SkillGap)
            .where(SkillGap.user_id == user_id, SkillGap.career_id == target_career.id)
            .options(selectinload(SkillGap.skill))
            .order_by(SkillGap.priority.asc())
        )
        gaps = list((await self.session.execute(stmt_gaps)).scalars().all())
        missing_skills = [g.skill.name for g in gaps if g.skill]

        if not missing_skills:
            stmt_cs = (
                select(CareerSkill)
                .where(CareerSkill.career_id == target_career.id)
                .options(selectinload(CareerSkill.skill))
            )
            career_skills = list((await self.session.execute(stmt_cs)).scalars().all())
            have_skill_names = {us.skill.name.lower() for us in user_skills if us.skill}
            missing_skills = [cs.skill.name for cs in career_skills if cs.skill and cs.skill.name.lower() not in have_skill_names]

        hours = req.hours_per_week or current.hours_per_week
        pace = req.learning_pace or current.learning_pace

        # Generate new curriculum
        curriculum = await ai_roadmap_generator.generate_curriculum(
            career_title=target_career.title,
            missing_skills=missing_skills,
            duration_months=current.duration_months,
            hours_per_week=hours,
            learning_pace=pace,
        )

        # Delete existing items
        for old_item in list(current.items or []):
            await self.session.delete(old_item)
        await self.session.flush()

        # Update current roadmap attributes
        new_version_num = current.version + 1
        current.version = new_version_num
        current.career_id = target_career.id
        current.title = f"Path to {target_career.title}"
        current.status = "ACTIVE"
        current.progress_percent = 0.0
        current.completed_hours = 0.0
        current.hours_per_week = hours
        current.learning_pace = pace
        current.phases = curriculum["phases"]
        current.milestones = curriculum["milestones"]

        total_hours = sum(item["estimated_hours"] for item in curriculum["items"])
        current.estimated_total_hours = total_hours
        weeks_needed = total_hours / max(1, hours)
        current.estimated_completion_date = (
            datetime.now(timezone.utc) + timedelta(days=int(weeks_needed * 7))
        ).strftime("%Y-%m-%d")

        current.roadmap_intelligence = {
            "verified_skills_count": len(verified_skill_names),
            "skill_gaps_count": len(missing_skills),
            "assessment_fit_pct": 0.0,
            "resume_points_count": 0,
            "target_career": target_career.title,
        }

        # Add new items
        for item_dict in curriculum["items"]:
            r_item = RoadmapItem(
                id=item_dict["id"],
                roadmap_id=current.id,
                month=item_dict["month"],
                phase_id=item_dict["phase_id"],
                title=item_dict["title"],
                description=item_dict["description"],
                item_type=item_dict["item_type"],
                priority=item_dict["priority"],
                status=item_dict["status"],
                skills=item_dict["skills"],
                tasks=item_dict["tasks"],
                estimated_hours=item_dict["estimated_hours"],
                actual_hours=0.0,
                item_order=item_dict["item_order"],
                dependencies=item_dict["dependencies"],
                resource_links=item_dict["resource_links"],
                project_id=item_dict["project_id"],
                is_completed=False,
                notes="",
            )
            self.session.add(r_item)

        await self.session.flush()

        # Recalculate Career Readiness
        readiness_score, breakdown = await self.calculate_career_readiness(user_id, target_career.id, 0.0)
        current.career_readiness_score = readiness_score
        current.readiness_breakdown = breakdown

        await self.session.flush()

        # Reload with items and career
        reloaded = await self.roadmap_repo.get_by_id(current.id)
        if reloaded:
            await self._sync_to_firestore(reloaded)
            self._emit_notification(
                user_id=user_id,
                title="Roadmap Regenerated",
                message=f"Version {new_version_num} of your {target_career.title} roadmap has been synthesized.",
                link="/roadmap",
            )
            record_audit_log(user_id, "ROADMAP_REGENERATED", f"roadmap:{reloaded.id}", {
                "version": new_version_num,
                "reason": req.reason or "User recalibrated curriculum",
            })

        return await self._format_roadmap_response(reloaded or current)

    async def update_roadmap_item(self, item_id: str, update_data: RoadmapItemUpdate, user_id: Optional[str] = None) -> RoadmapItemResponse:
        """Backward-compatible update for notes, task checklists, and completion toggle."""
        item = await self.roadmap_repo.get_item_with_roadmap(item_id)
        if not item:
            raise EntityNotFoundError("RoadmapItem", item_id)
        if user_id and item.roadmap and item.roadmap.user_id != user_id:
            raise PermissionDeniedError("Unauthorized access to roadmap item.")

        if update_data.is_completed is not None:
            if update_data.is_completed:
                return await self.complete_roadmap_item(item.roadmap.user_id, item_id)
            else:
                item.is_completed = False
                item.status = "NOT_STARTED"
                item.completed_at = None

        if update_data.tasks is not None:
            item.tasks = update_data.tasks
            # If all tasks checked, complete item
            if all(t.get("done") for t in update_data.tasks):
                return await self.complete_roadmap_item(item.roadmap.user_id, item_id)

        if update_data.notes is not None:
            item.notes = update_data.notes

        if update_data.actual_hours is not None:
            item.actual_hours = update_data.actual_hours

        if update_data.status:
            item.status = update_data.status

        await self.roadmap_repo.update_item(item)

        # Recalculate roadmap overall progress percentage
        if item.roadmap and item.roadmap.items:
            completed_count = sum(1 for i in item.roadmap.items if i.is_completed)
            item.roadmap.progress_percent = round((completed_count / len(item.roadmap.items)) * 100.0, 1)
            await self._sync_to_firestore(item.roadmap)

        return RoadmapItemResponse.model_validate(item)

    async def calculate_career_readiness(
        self,
        user_id: str,
        career_id: str,
        roadmap_progress: float,
    ) -> tuple[float, Dict[str, Any]]:
        """
        Documented Career Readiness Engine:
        - Skills Coverage: 35%
        - Assessment Fit: 20%
        - Project Readiness: 20%
        - Resume Evidence: 10%
        - Roadmap Completion: 15%
        """
        # 1. Skill Coverage
        stmt_cs = select(CareerSkill).where(CareerSkill.career_id == career_id).options(selectinload(CareerSkill.skill))
        career_skills = list((await self.session.execute(stmt_cs)).scalars().all())
        total_req_skills = max(len(career_skills), 8)

        stmt_us = select(UserSkill).where(UserSkill.user_id == user_id).options(selectinload(UserSkill.skill))
        user_skills = list((await self.session.execute(stmt_us)).scalars().all())
        user_skill_ids = {us.skill_id for us in user_skills if us.verified or us.proficiency >= 3}

        matched_skills = sum(1 for cs in career_skills if cs.skill_id in user_skill_ids)
        skill_cov_pct = min(100.0, round((matched_skills / total_req_skills) * 100.0, 1))

        # 2. Assessment Fit
        stmt_apt = (
            select(AptitudeAttempt)
            .where(AptitudeAttempt.user_id == user_id, AptitudeAttempt.status == AssessmentAttemptStatus.COMPLETED)
            .order_by(desc(AptitudeAttempt.completed_at))
        )
        apt_attempt = (await self.session.execute(stmt_apt)).scalars().first()
        assessment_fit = round(apt_attempt.score, 1) if apt_attempt and apt_attempt.score else 72.0

        # 3. Project Readiness
        # Ratio of completed project items or portfolio capstones
        roadmap = await self.roadmap_repo.get_by_user_and_career(user_id, career_id)
        if roadmap and roadmap.items:
            project_items = [i for i in roadmap.items if i.item_type in ["project", "practice"]]
            if project_items:
                proj_done = sum(1 for pi in project_items if pi.is_completed)
                project_readiness = min(100.0, round((proj_done / len(project_items)) * 100.0, 1))
            else:
                project_readiness = round(roadmap_progress * 0.8, 1)
        else:
            project_readiness = 45.0

        # 4. Resume Evidence
        stmt_res = select(ResumeAnalysis).where(ResumeAnalysis.user_id == user_id).order_by(desc(ResumeAnalysis.created_at))
        resume = (await self.session.execute(stmt_res)).scalars().first()
        resume_evidence = round(resume.ats_score, 1) if resume and resume.ats_score else 65.0

        # 5. Roadmap Completion
        roadmap_completion = round(roadmap_progress, 1)

        # Weighted composite readiness calculation
        composite = (
            0.35 * skill_cov_pct
            + 0.20 * assessment_fit
            + 0.20 * project_readiness
            + 0.10 * resume_evidence
            + 0.15 * roadmap_completion
        )
        final_readiness = round(min(100.0, composite), 1)

        breakdown = {
            "readiness_score": final_readiness,
            "skill_coverage": skill_cov_pct,
            "assessment_fit": assessment_fit,
            "resume_evidence": resume_evidence,
            "project_readiness": project_readiness,
            "roadmap_completion": roadmap_completion,
        }
        return final_readiness, breakdown

    def calculate_next_best_action(self, roadmap: Roadmap) -> NextBestActionResponse:
        """
        Determines the single highest priority unresolved milestone blocking progress.
        """
        items = roadmap.items or []
        if not items:
            return NextBestActionResponse()

        # Look for in-progress first
        in_progress = [i for i in items if i.status == "IN_PROGRESS"]
        if in_progress:
            target = in_progress[0]
            mins = int(target.estimated_hours * 60) if target.estimated_hours <= 2 else 45
            return NextBestActionResponse(
                item_id=target.id,
                title=f"Continue: {target.title}",
                phase_id=target.phase_id,
                priority=target.priority,
                estimated_hours=target.estimated_hours,
                estimated_minutes=mins,
                reason=f"This task is currently in progress and targets {', '.join(target.skills[:2]) or 'core competency'}.",
                action_label="Continue Task →",
                action_url=f"/roadmap#item-{target.id}",
            )

        # Look for first unlocked not-started item
        for it in items:
            if not it.is_completed and it.status in ["NOT_STARTED", "IN_PROGRESS"]:
                mins = int(it.estimated_hours * 60) if it.estimated_hours <= 2 else 60
                return NextBestActionResponse(
                    item_id=it.id,
                    title=f"Start: {it.title}",
                    phase_id=it.phase_id,
                    priority=it.priority,
                    estimated_hours=it.estimated_hours,
                    estimated_minutes=mins,
                    reason=f"This is the highest-priority unresolved competency blocking your next roadmap milestone.",
                    action_label="Start Next Task →",
                    action_url=f"/roadmap#item-{it.id}",
                )

        # All completed
        return NextBestActionResponse(
            title="Curriculum Complete! Finalize Capstone & Applications",
            priority="LOW",
            estimated_hours=0.0,
            estimated_minutes=0,
            reason="You have satisfied all milestones in this career curriculum.",
            action_label="Explore Jobs →",
            action_url="/recommendations",
        )

    async def _update_skill_evidence(self, user_id: str, career_id: str, skill_names: List[str]) -> None:
        """Updates user skill proficiency and marks verified evidence in both SQLite and Firestore."""
        for name in skill_names:
            clean_name = name.strip()
            if not clean_name:
                continue

            # Query or create Skill
            stmt_s = select(Skill).where(Skill.name.ilike(clean_name))
            skill = (await self.session.execute(stmt_s)).scalar_one_or_none()
            if not skill:
                skill = Skill(name=clean_name, description=f"Demonstrated in roadmap curriculum.")
                self.session.add(skill)
                await self.session.flush()

            # Query or create UserSkill
            stmt_us = select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_id == skill.id)
            user_skill = (await self.session.execute(stmt_us)).scalar_one_or_none()
            if user_skill:
                user_skill.proficiency = min(5, user_skill.proficiency + 1)
                user_skill.verified = True
            else:
                user_skill = UserSkill(
                    user_id=user_id,
                    skill_id=skill.id,
                    proficiency=3,
                    verified=True,
                )
                self.session.add(user_skill)

            # Reduce skill gap if exists
            stmt_gap = select(SkillGap).where(
                SkillGap.user_id == user_id,
                SkillGap.career_id == career_id,
                SkillGap.skill_id == skill.id,
            )
            gap = (await self.session.execute(stmt_gap)).scalar_one_or_none()
            if gap:
                gap.current_proficiency = user_skill.proficiency
                if gap.current_proficiency >= gap.required_proficiency:
                    gap.gap_severity = "Resolved"
                    gap.priority = 5
                elif (gap.required_proficiency - gap.current_proficiency) == 1:
                    gap.gap_severity = "Low"
                    gap.priority = 3

            # Sync to Firestore user_skills
            try:
                self.user_skills_firestore.set(
                    f"{user_id}_{skill.id}",
                    {
                        "userId": user_id,
                        "skillId": skill.id,
                        "skillName": skill.name,
                        "proficiency": user_skill.proficiency,
                        "verified": True,
                        "updatedAt": now_utc_iso(),
                    },
                )
            except Exception as e:
                logger.warning(f"Failed to sync UserSkill to Firestore: {e}")

        await self.session.flush()

    async def _format_roadmap_response(self, roadmap: Roadmap) -> RoadmapResponse:
        """Encapsulates roadmap into full typed response with phases and next best action."""
        items_resp = []
        for i in (roadmap.items or []):
            res_links = []
            for r in (i.resource_links or []):
                res_links.append(RoadmapResourceLink(
                    id=r.get("id", str(uuid.uuid4())[:8]),
                    title=r.get("title", "Resource"),
                    url=r.get("url", "https://docs.python.org/3/"),
                    type=r.get("type", "Documentation"),
                    is_completed=bool(r.get("is_completed", False)),
                ))

            items_resp.append(RoadmapItemResponse(
                id=i.id,
                month=i.month,
                phase_id=i.phase_id,
                title=i.title,
                description=i.description,
                item_type=i.item_type,
                priority=i.priority,
                status=i.status,
                skills=i.skills or [],
                tasks=i.tasks or [],
                estimated_hours=i.estimated_hours,
                actual_hours=i.actual_hours,
                item_order=i.item_order,
                dependencies=i.dependencies or [],
                resource_links=res_links,
                project_id=i.project_id,
                is_completed=i.is_completed,
                notes=i.notes,
                started_at=i.started_at,
                completed_at=i.completed_at,
            ))

        next_action = self.calculate_next_best_action(roadmap)

        # Format phases
        phases_resp = []
        for p in (roadmap.phases or []):
            phase_id = p.get("id", "phase_1")
            p_items = [it for it in items_resp if it.phase_id == phase_id]
            completed_p_items = sum(1 for it in p_items if it.is_completed)
            progress_pct = round((completed_p_items / len(p_items)) * 100.0, 1) if p_items else 0.0

            phases_resp.append(RoadmapPhaseResponse(
                id=phase_id,
                month=p.get("month", 1),
                title=p.get("title", f"Phase {p.get('month', 1)}"),
                subtitle=p.get("subtitle", "Curriculum Milestone"),
                description=p.get("description", ""),
                status="COMPLETED" if progress_pct >= 100.0 else ("IN_PROGRESS" if progress_pct > 0 else p.get("status", "NOT_STARTED")),
                progress_percent=progress_pct,
                target_skills=p.get("target_skills", []),
                items_count=len(p_items),
                completed_items_count=completed_p_items,
            ))

        career_title = roadmap.career.title if roadmap.career else "Target Career Path"

        return RoadmapResponse(
            id=roadmap.id,
            user_id=roadmap.user_id,
            career_id=roadmap.career_id,
            career_title=career_title,
            title=roadmap.title,
            description=roadmap.description,
            duration_months=roadmap.duration_months,
            progress_percent=roadmap.progress_percent,
            status=roadmap.status,
            version=roadmap.version,
            hours_per_week=roadmap.hours_per_week,
            learning_pace=roadmap.learning_pace,
            career_readiness_score=roadmap.career_readiness_score,
            readiness_breakdown=CareerReadinessBreakdown.model_validate(roadmap.readiness_breakdown or {}),
            roadmap_intelligence=RoadmapIntelligenceInfo.model_validate(roadmap.roadmap_intelligence or {}),
            estimated_total_hours=roadmap.estimated_total_hours,
            completed_hours=roadmap.completed_hours,
            estimated_completion_date=roadmap.estimated_completion_date,
            phases=phases_resp,
            milestones=roadmap.milestones or [],
            items=items_resp,
            next_best_action=next_action,
            created_at=roadmap.created_at,
            updated_at=roadmap.updated_at,
        )

    async def _sync_to_firestore(self, roadmap: Roadmap) -> None:
        """Mirrors the complete roadmap document and user active roadmap in Firestore."""
        try:
            items_payload = []
            for i in (roadmap.items or []):
                items_payload.append({
                    "id": i.id,
                    "month": i.month,
                    "phaseId": i.phase_id,
                    "title": i.title,
                    "description": i.description,
                    "itemType": i.item_type,
                    "priority": i.priority,
                    "status": i.status,
                    "skills": i.skills or [],
                    "tasks": i.tasks or [],
                    "estimatedHours": i.estimated_hours,
                    "actualHours": i.actual_hours,
                    "dependencies": i.dependencies or [],
                    "resourceLinks": i.resource_links or [],
                    "isCompleted": i.is_completed,
                    "notes": i.notes or "",
                    "completedAt": i.completed_at.isoformat() if i.completed_at else None,
                })

            payload = {
                "id": roadmap.id,
                "userId": roadmap.user_id,
                "careerId": roadmap.career_id,
                "careerTitle": roadmap.career.title if roadmap.career else "Target Career Path",
                "title": roadmap.title,
                "description": roadmap.description,
                "version": roadmap.version,
                "status": roadmap.status,
                "progressPercent": roadmap.progress_percent,
                "careerReadinessScore": roadmap.career_readiness_score,
                "readinessBreakdown": roadmap.readiness_breakdown or {},
                "roadmapIntelligence": roadmap.roadmap_intelligence or {},
                "estimatedTotalHours": roadmap.estimated_total_hours,
                "completedHours": roadmap.completed_hours,
                "hoursPerWeek": roadmap.hours_per_week,
                "learningPace": roadmap.learning_pace,
                "estimatedCompletionDate": roadmap.estimated_completion_date,
                "phases": roadmap.phases or [],
                "milestones": roadmap.milestones or [],
                "items": items_payload,
                "updatedAt": now_utc_iso(),
            }

            # Save in roadmaps collection
            self.roadmaps_firestore.set(roadmap.id, payload)
            # Also save active pointer document for candidate
            self.roadmaps_firestore.set(f"active_{roadmap.user_id}", payload)
        except Exception as e:
            logger.warning(f"Failed to sync Roadmap to Firestore: {e}")

    def _emit_notification(self, user_id: str, title: str, message: str, link: str = "/roadmap") -> None:
        """Emits a real-time notification document into Firestore."""
        try:
            self.notifications_firestore.create({
                "userId": user_id,
                "title": title,
                "message": message,
                "type": "ROADMAP",
                "isRead": False,
                "link": link,
                "createdAt": now_utc_iso(),
            })
        except Exception as e:
            logger.warning(f"Failed to emit roadmap notification: {e}")
