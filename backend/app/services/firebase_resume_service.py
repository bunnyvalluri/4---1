import uuid
from typing import Any, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.firebase.storage import (
    upload_file_bytes,
    download_file_bytes,
    validate_file_content,
    generate_resume_storage_path,
)
from app.ai.resume_analyzer import ResumeAnalyzer
from app.core.exceptions import ValidationError, PermissionDeniedError
from app.core.logging import logger


class FirebaseResumeService:
    """
    Implements the complete Firebase Resume Pipeline:
    Frontend -> Firebase Storage -> FastAPI -> Secure file retrieval -> Python PyMuPDF parser
    -> Text extraction -> AI/ML ATS analysis -> Firestore -> Frontend
    """

    def __init__(self):
        self.resumes_repo = FirestoreRepository(FirestoreCollections.RESUMES)
        self.analyses_repo = FirestoreRepository(FirestoreCollections.RESUME_ANALYSES)
        self.analyzer = ResumeAnalyzer()

    async def process_resume_upload(
        self,
        user_id: str,
        file_bytes: bytes,
        original_filename: str,
        target_skills: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Executes the secure resume ingestion, storage, parsing, and ATS auditing pipeline.
        """
        # 1. Inspect magic bytes, size, and detect true MIME type
        ext, detected_mime = validate_file_content(
            file_bytes=file_bytes,
            client_filename=original_filename,
            max_mb=10,
            allowed_category="resume",
        )

        resume_id = uuid.uuid4().hex
        storage_path = generate_resume_storage_path(user_id, resume_id, ext)

        # 2. Store binary document in Firebase Storage
        upload_file_bytes(
            file_bytes=file_bytes,
            destination_path=storage_path,
            content_type=detected_mime,
            metadata={
                "userId": user_id,
                "originalFilename": original_filename,
                "detectedMime": detected_mime,
                "uploadedAt": now_utc_iso(),
            },
        )

        # 3. Secure file retrieval from storage path for parsing
        retrieved_bytes = download_file_bytes(storage_path)

        # 4. Python parser (PyMuPDF / python-docx) & text extraction
        extracted_text = self.analyzer.parse_document(f"resume{ext}", retrieved_bytes)
        if not extracted_text:
            logger.warning(f"Could not extract selectable text for resume {resume_id}")

        # 5. AI/ML ATS analysis and scoring
        audit_result = self.analyzer.audit_resume(extracted_text, target_skills=target_skills)

        # 6. Persist metadata in Firestore 'resumes' collection
        resume_doc = {
            "userId": user_id,
            "resumeId": resume_id,
            "originalFilename": original_filename,
            "storagePath": storage_path,
            "mimeType": detected_mime,
            "fileSizeBytes": len(file_bytes),
            "createdAt": now_utc_iso(),
        }
        self.resumes_repo.set(resume_id, resume_doc)

        # 7. Persist analysis results in Firestore 'resume_analyses' collection
        analysis_doc = {
            "userId": user_id,
            "resumeId": resume_id,
            "atsScore": audit_result.get("ats_score", 0.0),
            "summary": audit_result.get("summary", ""),
            "extractedSkills": audit_result.get("extracted_skills", []),
            "missingSkills": audit_result.get("missing_skills", []),
            "formattingIssues": audit_result.get("formatting_issues", []),
            "weakBulletPoints": audit_result.get("weak_bullet_points", []),
            "suggestedKeywords": audit_result.get("suggested_keywords", []),
            "recommendations": audit_result.get("recommendations", []),
            "createdAt": now_utc_iso(),
        }
        self.analyses_repo.set(resume_id, analysis_doc)

        record_audit_log(user_id, "RESUME_ANALYZED", f"resumes/{resume_id}")

        return {
            "resume": resume_doc,
            "analysis": analysis_doc,
        }

    def get_user_resume_analysis(self, user_id: str, resume_id: str) -> Dict[str, Any]:
        """Retrieves resume analysis ensuring cross-user access is blocked."""
        resume = self.resumes_repo.get(resume_id)
        if not resume:
            raise ValidationError(f"Resume {resume_id} not found.")

        # Security check: User must own the resume
        if resume.get("userId") != user_id:
            raise PermissionDeniedError("Forbidden: User A cannot retrieve User B's resume.")

        analysis = self.analyses_repo.get(resume_id)
        return {
            "resume": resume,
            "analysis": analysis or {},
        }
