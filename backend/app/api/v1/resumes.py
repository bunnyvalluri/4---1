import uuid
from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db, AsyncSessionLocal
from app.api.deps import get_current_user
from app.models.user import User
from app.services.resume_service import ResumeService
from app.services.job_service import job_manager, JobStatus
from app.utils.file_utils import sanitize_filename
from app.utils.validators import is_allowed_file_extension
from app.core.logging import logger

router = APIRouter(prefix="/resumes", tags=["Resume"])
# Also support legacy /resume router prefix
legacy_router = APIRouter(prefix="/resume", tags=["Resume Legacy"])


async def run_resume_analysis_pipeline(
    job_id: str,
    user_id: str,
    file_name: str,
    file_bytes: bytes,
    career_id: Optional[str] = None,
):
    """Background processor for multi-stage resume parsing, career matching, and roadmap generation."""
    try:
        job_manager.update_job(job_id, JobStatus.PROCESSING, 15, "Extracting text and identifying structure")
        async with AsyncSessionLocal() as session:
            service = ResumeService(session)
            saved = await service.analyze_and_save_resume(
                user_id=user_id,
                file_name=file_name,
                file_bytes=file_bytes,
                career_id=career_id,
            )

        job_manager.update_job(
            job_id,
            JobStatus.COMPLETED,
            100,
            "Complete career intelligence pipeline executed successfully",
            result={
                "id": saved.id,
                "userId": saved.user_id,
                "careerId": saved.career_id,
                "fileName": saved.file_name,
                "atsScore": saved.ats_score,
                "extractedSkills": saved.extracted_skills,
                "missingSkills": saved.missing_skills,
                "formattingIssues": saved.formatting_issues,
                "weakBulletPoints": saved.weak_bullet_points,
                "suggestedKeywords": saved.suggested_keywords,
                "recommendations": saved.recommendations,
                "summary": saved.summary,
                "personalInfo": saved.personal_info,
                "education": saved.education,
                "experience": saved.experience,
                "projects": saved.projects,
                "certifications": saved.certifications,
                "careerSignals": saved.career_signals,
                "rankedCareers": saved.ranked_careers,
                "subScores": saved.sub_scores,
            },
        )
    except Exception as e:
        logger.error(f"[Job {job_id}] Resume pipeline failed: {e}")
        job_manager.update_job(
            job_id,
            JobStatus.FAILED,
            0,
            f"Analysis failed: {str(e)}",
            error=str(e),
        )


@router.post("")
@router.post("/upload-async")
@legacy_router.post("/upload-async")
async def upload_resume_endpoint(
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    career_id: Optional[str] = Form(None),
) -> Dict[str, Any]:
    """
    Ingests resume payload (File or Direct Paste) and immediately queues background analysis.
    Returns job_id < 50ms.
    """
    file_bytes: bytes = b""
    file_name: str = "Pasted_Resume.txt"

    if file and file.filename:
        safe_ext = file.filename.lower()
        if not (safe_ext.endswith(".pdf") or safe_ext.endswith(".docx") or safe_ext.endswith(".txt") or safe_ext.endswith(".doc")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload a PDF, DOCX, or TXT file.",
            )
        file_bytes = await file.read()
        file_name = file.filename
    elif text and text.strip():
        if len(text.strip()) < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pasted resume text is too short. Please provide comprehensive resume content.",
            )
        file_bytes = text.encode("utf-8")
        file_name = "Direct_Input_Resume.txt"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a resume document file or pasted resume text.",
        )

    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume payload exceeds maximum allowable 10MB limit.",
        )

    job_id = f"job-{uuid.uuid4().hex[:12]}"
    job_manager.create_job(job_id=job_id, user_id=current_user.id, job_type="RESUME_CAREER_ENGINE")

    background_tasks.add_task(
        run_resume_analysis_pipeline,
        job_id=job_id,
        user_id=current_user.id,
        file_name=file_name,
        file_bytes=file_bytes,
        career_id=career_id,
    )

    return {
        "job_id": job_id,
        "status": JobStatus.QUEUED,
        "progress": 5,
        "step_message": "Resume received. Asynchronous AI career analysis pipeline queued.",
    }


@router.post("/analyze-sync")
@legacy_router.post("/analyze-sync")
async def analyze_resume_sync_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    career_id: Optional[str] = Form(None),
) -> Dict[str, Any]:
    """
    Synchronously executes end-to-end resume intelligence pipeline, emitting real-time
    lifecycle events over SSE, and returning full ATS and roadmap analytics immediately.
    """
    file_bytes: bytes = b""
    file_name: str = "Direct_Resume.txt"

    if file and file.filename:
        file_bytes = await file.read()
        file_name = file.filename
    elif text and text.strip():
        file_bytes = text.encode("utf-8")
        file_name = "Direct_Input_Resume.txt"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a resume document file or pasted resume text.",
        )

    service = ResumeService(db)
    saved = await service.analyze_and_save_resume(
        user_id=current_user.id,
        file_name=file_name,
        file_bytes=file_bytes,
        career_id=career_id,
    )

    return {
        "success": True,
        "analysis": {
            "id": saved.id,
            "userId": saved.user_id,
            "careerId": saved.career_id,
            "fileName": saved.file_name,
            "atsScore": saved.ats_score,
            "extractedSkills": saved.extracted_skills,
            "missingSkills": saved.missing_skills,
            "formattingIssues": saved.formatting_issues,
            "weakBulletPoints": saved.weak_bullet_points,
            "suggestedKeywords": saved.suggested_keywords,
            "recommendations": saved.recommendations,
            "summary": saved.summary,
            "personalInfo": saved.personal_info,
            "education": saved.education,
            "experience": saved.experience,
            "projects": saved.projects,
            "certifications": saved.certifications,
            "careerSignals": saved.career_signals,
            "rankedCareers": saved.ranked_careers,
            "subScores": saved.sub_scores,
        },
    }


@router.get("/jobs/{job_id}")
@legacy_router.get("/jobs/{job_id}")
async def get_job_status_endpoint(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Dict[str, Any]:
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job identifier not found.",
        )
    return job.to_dict()


@router.get("/history")
@legacy_router.get("/history")
async def get_user_history_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[Dict[str, Any]]:
    service = ResumeService(db)
    items = await service.get_user_resumes(current_user.id)
    return [
        {
            "id": r.id,
            "userId": r.user_id,
            "careerId": r.career_id,
            "fileName": r.file_name,
            "atsScore": r.ats_score,
            "extractedSkills": r.extracted_skills,
            "missingSkills": r.missing_skills,
            "formattingIssues": r.formatting_issues,
            "weakBulletPoints": r.weak_bullet_points,
            "suggestedKeywords": r.suggested_keywords,
            "recommendations": r.recommendations,
            "summary": r.summary,
            "personalInfo": r.personal_info,
            "education": r.education,
            "experience": r.experience,
            "projects": r.projects,
            "certifications": r.certifications,
            "careerSignals": r.career_signals,
            "rankedCareers": r.ranked_careers,
            "subScores": r.sub_scores,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
        }
        for r in items
    ]


@router.get("/{analysis_id}")
@router.get("/{analysis_id}/analysis")
@legacy_router.get("/{analysis_id}")
@legacy_router.get("/{analysis_id}/analysis")
async def get_resume_analysis_endpoint(
    analysis_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    service = ResumeService(db)
    r = await service.get_resume_by_id(analysis_id)
    return {
        "id": r.id,
        "userId": r.user_id,
        "careerId": r.career_id,
        "fileName": r.file_name,
        "atsScore": r.ats_score,
        "extractedSkills": r.extracted_skills,
        "missingSkills": r.missing_skills,
        "formattingIssues": r.formatting_issues,
        "weakBulletPoints": r.weak_bullet_points,
        "suggestedKeywords": r.suggested_keywords,
        "recommendations": r.recommendations,
        "summary": r.summary,
        "personalInfo": r.personal_info,
        "education": r.education,
        "experience": r.experience,
        "projects": r.projects,
        "certifications": r.certifications,
        "careerSignals": r.career_signals,
        "rankedCareers": r.ranked_careers,
        "subScores": r.sub_scores,
        "createdAt": r.created_at.isoformat() if r.created_at else None,
    }
