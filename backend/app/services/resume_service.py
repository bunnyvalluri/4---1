import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.exceptions import EntityNotFoundError
from app.models.resume import ResumeAnalysis
from app.models.roadmap import Roadmap, RoadmapItem
from app.models.assignment import Assignment
from app.models.career import Career
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

        existing_record = await self.resume_repo.get_by_id(resume_record_id)
        if existing_record:
            existing_record.career_id = selected_career_id
            existing_record.file_name = safe_name
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

        # Persist Assignments in Neon DB if Career is valid
        if selected_career_id:
            for asgn in generated_assignments:
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

        await self.session.commit()
        logger.info(f"[ResumeService] Successfully analyzed & persisted resume {saved.id} for user {user_id}")
        return saved

    async def get_user_resumes(self, user_id: str) -> List[ResumeAnalysis]:
        return await self.resume_repo.get_by_user_id(user_id)

    async def get_resume_by_id(self, analysis_id: str) -> ResumeAnalysis:
        analysis = await self.resume_repo.get_by_id(analysis_id)
        if not analysis:
            raise EntityNotFoundError("ResumeAnalysis", analysis_id)
        return analysis
