import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from app.core.exceptions import EntityNotFoundError
from app.models.resume import ResumeAnalysis
from app.models.roadmap import Roadmap, RoadmapItem
from app.models.assignment import Assignment
from app.models.career import Career
from app.models.skill import Skill, UserSkill, SkillCategory
from app.models.recommendation import CareerRecommendation, SkillGap
from app.models.profile import Profile
from app.repositories.resume_repository import ResumeRepository
from app.ai.resume_intelligence import resume_intelligence
from app.services.career_roadmap_engine import career_roadmap_engine
from app.services.events import event_hub
from app.firebase.storage import upload_file_bytes, generate_resume_storage_path
from app.utils.file_utils import sanitize_filename
from app.core.logging import logger


class ResumeService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.resume_repo = ResumeRepository(session)

    async def analyze_and_save_resume(
        self,
        user_id: str,
        file_name: str,
        file_bytes: bytes,
        career_id: Optional[str] = None,
        resume_id: Optional[str] = None,
    ) -> ResumeAnalysis:
        safe_name = sanitize_filename(file_name) if file_name else "resume_input.txt"

        # 1. Event: resume.uploaded
        await event_hub.publish(user_id, "resume.uploaded", {
            "fileName": safe_name,
            "sizeBytes": len(file_bytes),
            "status": "uploaded",
        })

        # 2. Extract Text & Parse
        parsed_doc = resume_intelligence.parse_full_resume(safe_name, file_bytes, target_role=career_id)

        # Event: resume.text_extracted
        await event_hub.publish(user_id, "resume.text_extracted", {
            "charactersExtracted": len(parsed_doc["raw_text"]),
            "lineCount": len(parsed_doc["raw_text"].split("\n")),
        })

        # Event: resume.parsed
        await event_hub.publish(user_id, "resume.parsed", {
            "personalInfo": parsed_doc["personal_info"],
            "educationCount": len(parsed_doc["education"]),
            "experienceCount": len(parsed_doc["experience"]),
            "projectCount": len(parsed_doc["projects"]),
        })

        # Event: resume.skills_detected
        audit = parsed_doc["audit"]
        extracted_skills = audit["extracted_skills"]
        await event_hub.publish(user_id, "resume.skills_detected", {
            "skillsCount": len(extracted_skills),
            "extractedSkills": extracted_skills,
            "missingSkills": audit["missing_skills"],
        })

        # 3. Career Matching
        await event_hub.publish(user_id, "resume.career_analysis_started", {"status": "analyzing_careers"})
        ranked_careers = career_roadmap_engine.rank_careers(extracted_skills, parsed_doc["experience"])
        top_career = ranked_careers[0] if ranked_careers else {"careerId": "career_backend", "title": "Backend Developer", "matchScore": 88.0}
        selected_career_id = career_id or top_career.get("careerId")

        # Event: resume.career_analysis_completed
        await event_hub.publish(user_id, "resume.career_analysis_completed", {
            "topCareer": top_career["title"],
            "matchScore": top_career["matchScore"],
            "rankedCareers": ranked_careers[:3],
        })

        # 4. Skill Gap Analysis
        skill_gaps = career_roadmap_engine.generate_skill_gaps(extracted_skills, top_career)
        await event_hub.publish(user_id, "resume.skill_gap_analysis_completed", {
            "gapCount": len(skill_gaps),
            "topGaps": skill_gaps[:4],
        })

        # 5. Dynamic Roadmap Generation
        await event_hub.publish(user_id, "roadmap.generation_started", {"status": "generating_roadmap"})
        roadmap_data = career_roadmap_engine.generate_dynamic_roadmap(extracted_skills, parsed_doc["projects"], top_career)

        await event_hub.publish(user_id, "roadmap.generated", {
            "roadmapTitle": roadmap_data["title"],
            "totalWeeks": roadmap_data["totalWeeks"],
            "phasesCount": len(roadmap_data["phases"]),
        })

        # 6. Hands-On Assignments Generation
        generated_assignments = career_roadmap_engine.generate_assignments(selected_career_id, roadmap_data)
        await event_hub.publish(user_id, "assignments.generated", {
            "count": len(generated_assignments),
            "firstAssignment": generated_assignments[0]["title"] if generated_assignments else "",
        })

        # 7. File Storage Persistence (Firebase Cloud Storage with fallback)
        resume_record_id = resume_id or f"res_{uuid.uuid4().hex[:12]}"
        ext = ".pdf" if safe_name.lower().endswith(".pdf") else ".docx" if safe_name.lower().endswith(".docx") else ".txt"
        storage_dest = generate_resume_storage_path(user_id, resume_record_id, ext)
        mime_type = "application/pdf" if ext == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if ext == ".docx" else "text/plain"

        try:
            upload_file_bytes(file_bytes, storage_dest, mime_type, {"user_id": user_id, "file_name": safe_name})
        except Exception as e:
            logger.warning(f"[ResumeService] Storage upload fallback: {e}")

        # 8. Neon PostgreSQL Database Persistence
        # Ensure target Career exists in database so foreign key doesn't fail
        career_stmt = select(Career).where(Career.id == selected_career_id)
        career_res = await self.session.execute(career_stmt)
        existing_career = career_res.scalar_one_or_none()
        if not existing_career:
            fallback_career_stmt = select(Career).limit(1)
            fallback_res = await self.session.execute(fallback_career_stmt)
            existing_career = fallback_res.scalar_one_or_none()
            if existing_career:
                selected_career_id = existing_career.id
            else:
                selected_career_id = None

        # Compute resume version and mark previous resumes not current
        count_stmt = select(func.count(ResumeAnalysis.id)).where(ResumeAnalysis.user_id == user_id)
        existing_resumes_count = (await self.session.scalar(count_stmt)) or 0
        version_num = existing_resumes_count + 1

        update_prev_stmt = (
            update(ResumeAnalysis)
            .where(ResumeAnalysis.user_id == user_id)
            .values(is_current=False)
        )
        await self.session.execute(update_prev_stmt)

        existing_record = await self.resume_repo.get_by_id(resume_record_id)
        if existing_record:
            existing_record.career_id = selected_career_id
            existing_record.file_name = safe_name
            existing_record.version = version_num
            existing_record.is_current = True
            existing_record.status = "COMPLETED"
            existing_record.ats_score = audit["ats_score"]
            existing_record.extracted_skills = extracted_skills
            existing_record.missing_skills = audit["missing_skills"]
            existing_record.formatting_issues = audit["formatting_issues"]
            existing_record.weak_bullet_points = audit["weak_bullet_points"]
            existing_record.suggested_keywords = audit["suggested_keywords"]
            existing_record.recommendations = audit["recommendations"]
            existing_record.summary = audit["summary"]
            existing_record.raw_text = parsed_doc["raw_text"][:45000]
            existing_record.storage_path = storage_dest
            existing_record.personal_info = parsed_doc["personal_info"]
            existing_record.education = parsed_doc["education"]
            existing_record.experience = parsed_doc["experience"]
            existing_record.projects = parsed_doc["projects"]
            existing_record.certifications = parsed_doc["certifications"]
            existing_record.career_signals = parsed_doc["career_signals"]
            existing_record.ranked_careers = ranked_careers
            existing_record.sub_scores = audit["sub_scores"]
            saved = existing_record
        else:
            analysis = ResumeAnalysis(
                id=resume_record_id,
                user_id=user_id,
                career_id=selected_career_id,
                file_name=safe_name,
                version=version_num,
                is_current=True,
                status="COMPLETED",
                ats_score=audit["ats_score"],
                extracted_skills=extracted_skills,
                missing_skills=audit["missing_skills"],
                formatting_issues=audit["formatting_issues"],
                weak_bullet_points=audit["weak_bullet_points"],
                suggested_keywords=audit["suggested_keywords"],
                recommendations=audit["recommendations"],
                summary=audit["summary"],
                raw_text=parsed_doc["raw_text"][:45000],
                storage_path=storage_dest,
                personal_info=parsed_doc["personal_info"],
                education=parsed_doc["education"],
                experience=parsed_doc["experience"],
                projects=parsed_doc["projects"],
                certifications=parsed_doc["certifications"],
                career_signals=parsed_doc["career_signals"],
                ranked_careers=ranked_careers,
                sub_scores=audit["sub_scores"],
            )
            saved = await self.resume_repo.create(analysis)

        # 9. Downstream Relational Entity Synchronization in PostgreSQL

        # A. Synchronize Skills & UserSkills
        for s_name in extracted_skills[:30]:
            try:
                stmt_s = select(Skill).where(Skill.name == s_name)
                skill_res = await self.session.execute(stmt_s)
                skill_obj = skill_res.scalar_one_or_none()
                if not skill_obj:
                    skill_obj = Skill(
                        id=f"sk_{uuid.uuid4().hex[:12]}",
                        name=s_name,
                        category=SkillCategory.TECHNICAL,
                        description=f"Demonstrated competency in {s_name}",
                    )
                    self.session.add(skill_obj)
                    await self.session.flush()

                stmt_us = select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_id == skill_obj.id)
                us_res = await self.session.execute(stmt_us)
                user_skill_obj = us_res.scalar_one_or_none()
                if user_skill_obj:
                    user_skill_obj.proficiency = max(user_skill_obj.proficiency, 3)
                    user_skill_obj.verified = True
                else:
                    new_us = UserSkill(
                        id=f"usk_{uuid.uuid4().hex[:12]}",
                        user_id=user_id,
                        skill_id=skill_obj.id,
                        proficiency=3,
                        verified=True,
                    )
                    self.session.add(new_us)
            except Exception as skill_err:
                logger.debug(f"[ResumeService] UserSkill sync error: {skill_err}")

        # B. Synchronize Career Recommendations
        for rc in (ranked_careers or [])[:5]:
            try:
                rc_career_id = rc.get("careerId")
                if not rc_career_id:
                    continue

                c_check = await self.session.execute(select(Career).where(Career.id == rc_career_id))
                c_rec = c_check.scalar_one_or_none()
                if not c_rec:
                    c_rec = Career(
                        id=rc_career_id,
                        title=rc.get("title", "Software Engineer"),
                        slug=rc.get("slug", "software-engineer"),
                        category=rc.get("category", "Software Engineering"),
                        description=rc.get("description") or rc.get("reasoning") or "Professional career path in software engineering.",
                        overview=rc.get("reasoning", "Recommended based on analyzed resume skills"),
                        salary_range="$95,000 - $145,000",
                        demand_level="High",
                        experience_level="Entry / Mid",
                        education_reqs="Bachelor's degree or equivalent practical industry experience",
                        aptitude_reqs={},
                        common_job_titles=[rc.get("title", "Software Engineer")],
                    )
                    self.session.add(c_rec)
                    await self.session.flush()

                stmt_rec = select(CareerRecommendation).where(
                    CareerRecommendation.user_id == user_id,
                    CareerRecommendation.career_id == c_rec.id,
                )
                existing_rec = (await self.session.execute(stmt_rec)).scalar_one_or_none()
                match_val = float(rc.get("matchScore", 80.0))
                if existing_rec:
                    existing_rec.match_score = match_val
                    existing_rec.matching_skills = rc.get("matchingSkills", [])
                    existing_rec.missing_skills = rc.get("missingSkills", [])
                    existing_rec.reasoning = rc.get("reasoning", "")
                else:
                    new_rec = CareerRecommendation(
                        id=f"crec_{uuid.uuid4().hex[:12]}",
                        user_id=user_id,
                        career_id=c_rec.id,
                        match_score=match_val,
                        matching_skills=rc.get("matchingSkills", []),
                        missing_skills=rc.get("missingSkills", []),
                        reasoning=rc.get("reasoning", ""),
                        breakdown={"skills": match_val, "experience": 85, "education": 80},
                        recommended_actions=[
                            f"Focus on missing competencies: {', '.join(rc.get('missingSkills', [])[:3])}",
                            "Build hands-on production repository with automated CI workflows",
                        ],
                    )
                    self.session.add(new_rec)
            except Exception as rec_err:
                logger.debug(f"[ResumeService] CareerRecommendation sync error: {rec_err}")

        # C. Synchronize Skill Gaps
        if selected_career_id and skill_gaps:
            for sg in skill_gaps[:6]:
                try:
                    gap_name = sg.get("skill") or sg.get("name")
                    if not gap_name:
                        continue
                    stmt_gs = select(Skill).where(Skill.name == gap_name)
                    gap_skill = (await self.session.execute(stmt_gs)).scalar_one_or_none()
                    if not gap_skill:
                        gap_skill = Skill(
                            id=f"sk_{uuid.uuid4().hex[:12]}",
                            name=gap_name,
                            category=SkillCategory.TECHNICAL,
                            description=f"Skill gap: {gap_name}",
                        )
                        self.session.add(gap_skill)
                        await self.session.flush()

                    stmt_gap = select(SkillGap).where(
                        SkillGap.user_id == user_id,
                        SkillGap.career_id == selected_career_id,
                        SkillGap.skill_id == gap_skill.id,
                    )
                    existing_gap = (await self.session.execute(stmt_gap)).scalar_one_or_none()
                    if not existing_gap:
                        new_gap = SkillGap(
                            id=f"sg_{uuid.uuid4().hex[:12]}",
                            user_id=user_id,
                            career_id=selected_career_id,
                            skill_id=gap_skill.id,
                            current_proficiency=sg.get("currentProficiency", 1),
                            required_proficiency=sg.get("requiredProficiency", 3),
                            gap_severity=sg.get("gapSeverity", "Moderate"),
                            priority=sg.get("priority", 1),
                        )
                        self.session.add(new_gap)
                except Exception as gap_err:
                    logger.debug(f"[ResumeService] SkillGap sync error: {gap_err}")

        # D. Synchronize Roadmap and Roadmap Items
        if selected_career_id and roadmap_data:
            try:
                stmt_road = select(Roadmap).where(
                    Roadmap.user_id == user_id,
                    Roadmap.career_id == selected_career_id,
                )
                existing_road = (await self.session.execute(stmt_road)).scalar_one_or_none()
                if existing_road:
                    existing_road.title = roadmap_data.get("title", f"{top_career['title']} Roadmap")
                    existing_road.status = "ACTIVE"
                    active_road_id = existing_road.id
                else:
                    new_road = Roadmap(
                        id=f"rdm_{uuid.uuid4().hex[:12]}",
                        user_id=user_id,
                        career_id=selected_career_id,
                        title=roadmap_data.get("title", f"{top_career['title']} Roadmap"),
                        description=roadmap_data.get("description", "Dynamic 12-week roadmap customized from resume."),
                        duration_months=3,
                        progress_percent=0.0,
                        status="ACTIVE",
                    )
                    self.session.add(new_road)
                    await self.session.flush()
                    active_road_id = new_road.id

                # Clear previous items and replace with new dynamic items
                await self.session.execute(delete(RoadmapItem).where(RoadmapItem.roadmap_id == active_road_id))
                phases = roadmap_data.get("phases", [])
                for idx, phase in enumerate(phases):
                    m_item = RoadmapItem(
                        id=f"item_{uuid.uuid4().hex[:12]}",
                        roadmap_id=active_road_id,
                        month=idx + 1,
                        phase_id=f"phase_{idx + 1}",
                        title=phase.get("title", f"Phase {idx + 1}"),
                        description=phase.get("description", "Milestone objectives"),
                        skills=phase.get("skills", []),
                        tasks=phase.get("tasks", []),
                        is_completed=False,
                    )
                    self.session.add(m_item)
            except Exception as road_err:
                logger.debug(f"[ResumeService] Roadmap sync error: {road_err}")

        # E. Persist Assignments in Neon DB if Career is valid
        if selected_career_id and generated_assignments:
            for asgn in generated_assignments:
                try:
                    stmt_as = select(Assignment).where(Assignment.id == asgn["id"])
                    existing_as = (await self.session.execute(stmt_as)).scalar_one_or_none()
                    if not existing_as:
                        assignment_entity = Assignment(
                            id=asgn["id"],
                            career_id=selected_career_id,
                            title=asgn["title"],
                            description=asgn["description"],
                            difficulty=asgn["difficulty"],
                            estimated_hours=asgn["estimatedHours"],
                            skills=asgn["skills"],
                            prerequisites=asgn["prerequisites"],
                            instructions=asgn["instructions"],
                            requirements=asgn["requirements"],
                            acceptance_criteria=asgn["acceptanceCriteria"],
                            submission_type=asgn["submissionType"],
                            starter_repo_url=asgn.get("starterRepoUrl"),
                            automated_tests=asgn.get("automatedTests"),
                            resources=asgn.get("resources"),
                            status=asgn["status"],
                            score=asgn["score"],
                        )
                        self.session.add(assignment_entity)
                except Exception as asgn_err:
                    logger.debug(f"[ResumeService] Assignment sync error: {asgn_err}")

        # F. Update Profile
        try:
            stmt_prof = select(Profile).where(Profile.user_id == user_id)
            profile_obj = (await self.session.execute(stmt_prof)).scalar_one_or_none()
            if profile_obj:
                profile_obj.career_goals = top_career.get("title", "Backend Developer")
                profile_obj.preferred_roles = [c.get("title") for c in (ranked_careers or [])[:3]]
        except Exception:
            pass

        await self.session.commit()
        logger.info(f"[ResumeService] Successfully analyzed & persisted resume {saved.id} (v{saved.version}) for user {user_id}")

        # 10. Granular Downstream Real-Time Events
        await event_hub.publish(user_id, "profile.updated", {"targetCareer": top_career["title"]})
        await event_hub.publish(user_id, "skills.updated", {"skillsCount": len(extracted_skills)})
        await event_hub.publish(user_id, "career_matches.updated", {"topCareer": top_career["title"], "matchScore": top_career["matchScore"]})
        await event_hub.publish(user_id, "resume.analysis.completed", {
            "resume_id": saved.id,
            "user_id": user_id,
            "version": saved.version,
            "status": "completed",
            "ats_score": saved.ats_score,
            "topCareer": top_career["title"],
        })
        return saved

    async def get_user_resumes(self, user_id: str) -> List[ResumeAnalysis]:
        return await self.resume_repo.get_by_user_id(user_id)

    async def get_resume_by_id(self, analysis_id: str) -> ResumeAnalysis:
        analysis = await self.resume_repo.get_by_id(analysis_id)
        if not analysis:
            raise EntityNotFoundError("ResumeAnalysis", analysis_id)
        return analysis
