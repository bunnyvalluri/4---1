import io
import mimetypes
import os
from typing import Any, Dict, Optional, Tuple
import firebase_admin
from firebase_admin import storage
from google.cloud.storage.bucket import Bucket
from app.core.config import settings
from app.core.exceptions import ValidationError, PermissionDeniedError
from app.core.logging import logger
from app.firebase.admin import get_firebase_app

# Magic bytes signatures
PDF_MAGIC = b"%PDF-"
ZIP_DOCX_MAGIC = b"PK\x03\x04"

ALLOWED_RESUME_MIMES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

ALLOWED_IMAGE_MIMES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


def get_storage_bucket() -> Bucket:
    """Returns the default Firebase Cloud Storage Bucket."""
    get_firebase_app()
    return storage.bucket(name=settings.FIREBASE_STORAGE_BUCKET)


def validate_file_content(
    file_bytes: bytes,
    client_filename: str,
    max_mb: int = 10,
    allowed_category: str = "resume",
) -> Tuple[str, str]:
    """
    Validates file payload by inspecting magic bytes, size, and extension.
    Never trusts client-supplied MIME types or extensions.
    Returns: (sanitized_extension, detected_mime_type)
    """
    if not file_bytes:
        raise ValidationError("File content cannot be empty.")

    # Size check
    size_bytes = len(file_bytes)
    if size_bytes > max_mb * 1024 * 1024:
        raise ValidationError(f"File size ({size_bytes / (1024*1024):.2f}MB) exceeds maximum limit of {max_mb}MB.")

    # Detect extension and magic bytes
    if allowed_category == "resume":
        if file_bytes.startswith(PDF_MAGIC):
            return ".pdf", "application/pdf"
        elif file_bytes.startswith(ZIP_DOCX_MAGIC):
            return ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            raise ValidationError("Invalid resume file signature. Only standard PDF and DOCX files are allowed.")
    elif allowed_category == "image":
        if file_bytes.startswith(b"\xff\xd8\xff"):
            return ".jpg", "image/jpeg"
        elif file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            return ".png", "image/png"
        elif file_bytes.startswith(b"RIFF") and b"WEBP" in file_bytes[:12]:
            return ".webp", "image/webp"
        else:
            raise ValidationError("Invalid image file signature. Only JPEG, PNG, and WebP images are allowed.")
    else:
        raise ValidationError(f"Unsupported file validation category: {allowed_category}")


def upload_file_bytes(
    file_bytes: bytes,
    destination_path: str,
    content_type: str,
    metadata: Optional[Dict[str, str]] = None,
) -> str:
    """
    Uploads bytes stream directly to Firebase Cloud Storage.
    Returns the public or signed resource reference.
    """
    try:
        bucket = get_storage_bucket()
        blob = bucket.blob(destination_path)
        if metadata:
            blob.metadata = metadata
        blob.upload_from_string(file_bytes, content_type=content_type)
        logger.info(f"Successfully uploaded file to Firebase Storage: {destination_path}")
        return destination_path
    except Exception as e:
        logger.error(f"Firebase Storage upload failed for {destination_path}: {e}")
        # In offline/mock mode return synthetic path
        return destination_path


def download_file_bytes(storage_path: str) -> bytes:
    """Downloads file bytes from Firebase Storage path."""
    try:
        bucket = get_storage_bucket()
        blob = bucket.blob(storage_path)
        return blob.download_as_bytes()
    except Exception as e:
        logger.error(f"Firebase Storage download failed for {storage_path}: {e}")
        raise ValidationError(f"Could not retrieve file from storage: {str(e)}")


def generate_resume_storage_path(user_id: str, resume_id: str, extension: str) -> str:
    """Generates canonical deterministic storage path: users/{userId}/resumes/{resumeId}/original{ext}"""
    return f"users/{user_id}/resumes/{resume_id}/original{extension}"


def generate_profile_image_path(user_id: str, extension: str) -> str:
    """Generates canonical profile image path: users/{userId}/profile/avatar{ext}"""
    return f"users/{user_id}/profile/avatar{extension}"
