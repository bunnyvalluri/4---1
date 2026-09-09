import uuid
from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db, AsyncSessionLocal
from app.api.deps import get_current_user
from app.models.user import User
from app.services.resume_service import ResumeService
from app.services.job_service import job_manager, JobStatus
from app.ai.resume_analyzer import resume_analyzer
from app.utils.file_utils import sanitize_filename
from app.schemas.resume import (
    ResumeAnalysisResponse,
    ResumeUploadResponse,
    BulletOptimizationRequest,
)
from app.utils.validators import is_allowed_file_extension
from app.core.logging import logger

router = APIRouter(prefix="/resume", tags=["Resume"])


async def run_resume_analysis_job(
    job_id: str,
    user_id: str,
    file_name: str,
    file_bytes: bytes,
    career_id: Optional[str] = None,
):
    """Background processor for resume parsing and ATS auditing without blocking the API."""
    try:
        job_manager.update_job(job_id, JobStatus.PROCESSING, 25, "Extracting text from resume")
        safe_name = sanitize_filename(file_name)
        text = resume_analyzer.parse_document(safe_name, file_bytes)

        job_manager.update_job(job_id, JobStatus.ANALYZING, 60, "Auditing ATS score and keyword matching")
        audit_results = resume_analyzer.audit_resume(text)

        job_manager.update_job(job_id, JobStatus.ALMOST_COMPLETE, 85, "Saving intelligence profile")

        async with AsyncSessionLocal() as session:
            service = ResumeService(session)
            saved = await service.analyze_and_save_resume(
                user_id=user_id,
                file_name=safe_name,
                file_bytes=file_bytes,
                career_id=career_id,
            )
            await session.commit()
            result_payload = {
                "id": saved.id,
                "user_id": saved.user_id,
                "career_id": saved.career_id,
                "file_name": saved.file_name,
                "ats_score": saved.ats_score,
                "extracted_skills": saved.extracted_skills,
                "missing_skills": saved.missing_skills,
                "formatting_issues": saved.formatting_issues,
                "weak_bullet_points": saved.weak_bullet_points,
                "suggested_keywords": saved.suggested_keywords,
                "recommendations": saved.recommendations,
                "summary": saved.summary,
            }

        job_manager.update_job(
            job_id,
            JobStatus.COMPLETED,
            100,
            "Analysis complete",
            result=result_payload,
        )
    except Exception as e:
        logger.error(f"[Job {job_id}] Resume background processing failed: {e}")
        job_manager.update_job(
            job_id,
            JobStatus.FAILED,
            0,
            f"Analysis failed: {str(e)}",
            error=str(e),
        )


@router.post("/upload-async")
async def upload_resume_async(
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
    career_id: Optional[str] = Form(None),
) -> Dict[str, Any]:
    """
    Non-blocking asynchronous resume ingestion endpoint.
    Accepts resume payload, immediately registers background task,
    and returns a unique job_id in < 50ms without freezing the UI.
    """
    if not is_allowed_file_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF or DOCX file.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed 10MB.",
        )

    job_id = f"job-{uuid.uuid4().hex[:12]}"
    job_manager.create_job(job_id=job_id, user_id=current_user.id, job_type="RESUME_ANALYSIS")

    background_tasks.add_task(
        run_resume_analysis_job,
        job_id=job_id,
        user_id=current_user.id,
        file_name=file.filename,
        file_bytes=file_bytes,
        career_id=career_id,
    )

    return {
        "job_id": job_id,
        "status": JobStatus.QUEUED,
        "progress": 5,
        "step_message": "Resume uploaded successfully. Analysis scheduled in background.",
    }


@router.get("/jobs/{job_id}")
async def get_resume_job_status(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Dict[str, Any]:
    """Checks progress status of an asynchronous resume processing job."""
    job = job_manager.get_job(job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or unauthorized.",
        )
    return job.to_dict()


@router.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
    career_id: Optional[str] = Form(None),
):
    if not is_allowed_file_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF or DOCX file.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed 10MB.",
        )

    service = ResumeService(db)
    return await service.analyze_and_save_resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_bytes=file_bytes,
        career_id=career_id,
    )


@router.get("/history", response_model=List[ResumeAnalysisResponse])
async def get_resume_history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ResumeService(db)
    return await service.get_user_resumes(current_user.id)


@router.get("/{analysis_id}", response_model=ResumeAnalysisResponse)
async def get_resume_analysis(
    analysis_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ResumeService(db)
    return await service.get_resume_by_id(analysis_id)

