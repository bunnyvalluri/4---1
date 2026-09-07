from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.resume_service import ResumeService
from app.schemas.resume import (
    ResumeAnalysisResponse,
    ResumeUploadResponse,
    BulletOptimizationRequest,
)
from app.utils.validators import is_allowed_file_extension

router = APIRouter(prefix="/resume", tags=["Resume"])


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
