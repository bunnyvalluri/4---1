from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.models.resume import ResumeAnalysis
from app.repositories.resume_repository import ResumeRepository
from app.ai.resume_analyzer import resume_analyzer
from app.utils.file_utils import sanitize_filename


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
    ) -> ResumeAnalysis:
        safe_name = sanitize_filename(file_name)
        text = resume_analyzer.parse_document(safe_name, file_bytes)
        audit_results = resume_analyzer.audit_resume(text)

        analysis = ResumeAnalysis(
            user_id=user_id,
            career_id=career_id,
            file_name=safe_name,
            ats_score=audit_results["ats_score"],
            extracted_skills=audit_results["extracted_skills"],
            missing_skills=audit_results["missing_skills"],
            formatting_issues=audit_results["formatting_issues"],
            weak_bullet_points=audit_results["weak_bullet_points"],
            suggested_keywords=audit_results["suggested_keywords"],
            recommendations=audit_results["recommendations"],
            summary=audit_results["summary"],
        )
        return await self.resume_repo.create(analysis)

    async def get_user_resumes(self, user_id: str) -> List[ResumeAnalysis]:
        return await self.resume_repo.get_by_user_id(user_id)

    async def get_resume_by_id(self, analysis_id: str) -> ResumeAnalysis:
        analysis = await self.resume_repo.get_by_id(analysis_id)
        if not analysis:
            raise EntityNotFoundError("ResumeAnalysis", analysis_id)
        return analysis
