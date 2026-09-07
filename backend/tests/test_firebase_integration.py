import io
import pytest
from unittest.mock import patch, MagicMock
from app.firebase.admin import initialize_firebase, get_firebase_app
from app.firebase.auth import verify_firebase_token, set_user_role
from app.firebase.storage import (
    validate_file_content,
    generate_resume_storage_path,
    generate_profile_image_path,
)
from app.firebase.firestore import (
    FirestoreRepository,
    FirestoreCollections,
    now_utc_iso,
    record_audit_log,
)
from app.services.firebase_auth_service import FirebaseAuthService
from app.services.firebase_resume_service import FirebaseResumeService
from app.services.firebase_roadmap_service import FirebaseRoadmapService
from app.core.exceptions import AuthenticationError, PermissionDeniedError, ValidationError
from app.api.deps import get_current_user, get_current_admin, FirebaseUserWrapper
from app.models.user import Role


# ==========================================================
# 1. FIREBASE ADMIN & TOKEN VERIFICATION TESTS
# ==========================================================

def test_firebase_admin_initialization():
    """Verifies Firebase Admin SDK initializes successfully."""
    app = initialize_firebase()
    assert app is not None
    assert get_firebase_app() is app


def test_token_verification_missing_token():
    """Verifies rejection of empty or missing authorization token."""
    with pytest.raises(AuthenticationError, match="Authorization token required"):
        verify_firebase_token("")


def test_token_verification_invalid_token():
    """Verifies rejection of invalid or malformed tokens."""
    with patch("firebase_admin.auth.verify_id_token", side_effect=Exception("Signature verification failed")):
        with pytest.raises(AuthenticationError):
            verify_firebase_token("Bearer invalid_token_12345")


def test_token_verification_success():
    """Verifies successful token decoding and extraction of claims."""
    mock_payload = {
        "uid": "user_alpha_123",
        "email": "alpha@example.com",
        "name": "Alpha User",
        "role": "USER",
        "email_verified": True,
    }
    with patch("firebase_admin.auth.verify_id_token", return_value=mock_payload):
        decoded = verify_firebase_token("Bearer valid_mock_token")
        assert decoded["uid"] == "user_alpha_123"
        assert decoded["email"] == "alpha@example.com"
        assert decoded["role"] == "USER"


# ==========================================================
# 2. STORAGE VALIDATION & PIPELINE TESTS
# ==========================================================

def test_storage_path_generators():
    """Verifies deterministic storage path conventions."""
    resume_path = generate_resume_storage_path("user_123", "res_456", ".pdf")
    assert resume_path == "users/user_123/resumes/res_456/original.pdf"

    image_path = generate_profile_image_path("user_123", ".png")
    assert image_path == "users/user_123/profile/avatar.png"


def test_storage_validation_valid_pdf():
    """Verifies magic byte detection on genuine PDF documents."""
    valid_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    ext, mime = validate_file_content(valid_pdf_bytes, "resume.pdf", max_mb=10, allowed_category="resume")
    assert ext == ".pdf"
    assert mime == "application/pdf"


def test_storage_validation_valid_docx():
    """Verifies magic byte detection on valid DOCX zip payloads."""
    valid_docx_bytes = b"PK\x03\x04\x14\x00\x06\x00word/document.xml"
    ext, mime = validate_file_content(valid_docx_bytes, "resume.docx", max_mb=10, allowed_category="resume")
    assert ext == ".docx"
    assert "wordprocessingml" in mime


def test_storage_validation_fake_extension_rejected():
    """Security test: Text or binary files disguised as PDF are rejected by magic byte inspection."""
    malicious_bytes = b"echo 'Malicious binary payload'"
    with pytest.raises(ValidationError, match="Invalid resume file signature"):
        validate_file_content(malicious_bytes, "fake.pdf", max_mb=10, allowed_category="resume")


def test_storage_validation_oversized_file_rejected():
    """Security test: Upload exceeding max_mb is rejected immediately."""
    large_pdf_bytes = b"%PDF-" + b"0" * (11 * 1024 * 1024)
    with pytest.raises(ValidationError, match="exceeds maximum limit"):
        validate_file_content(large_pdf_bytes, "huge.pdf", max_mb=10, allowed_category="resume")


# ==========================================================
# 3. RESUME ANALYSIS PIPELINE & CROSS-USER ISOLATION
# ==========================================================

@pytest.mark.asyncio
async def test_resume_pipeline_and_cross_user_isolation():
    """
    End-to-end pipeline test:
    1. User A uploads resume -> stored & analyzed in Firestore
    2. User A can retrieve their own analysis
    3. User B attempting to retrieve User A's resume raises PermissionDeniedError
    """
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Experience\nSenior Backend Engineer at TechCorp\nAccomplished cloud migration as measured by 40% latency reduction by doing FastAPI refactoring.\nEducation\nB.S. Computer Science\nSkills\nPython, FastAPI, Docker, PostgreSQL\nProjects\nHigh throughput distributed rate limiter.")
    valid_pdf_content = doc.write()

    # In-memory storage mock
    storage_mock = {}
    def mock_upload(file_bytes, destination_path, content_type, metadata=None):
        storage_mock[destination_path] = file_bytes
        return destination_path

    def mock_download(storage_path):
        return storage_mock.get(storage_path, valid_pdf_content)

    # In-memory firestore collection mock
    db_mock = {}
    class MockRepo:
        def __init__(self, name):
            self.name = name
            db_mock.setdefault(name, {})
        def set(self, doc_id, data, merge=True):
            db_mock[self.name][doc_id] = data
            data["id"] = doc_id
            return data
        def get(self, doc_id):
            return db_mock[self.name].get(doc_id)

    with patch("app.services.firebase_resume_service.upload_file_bytes", side_effect=mock_upload), \
         patch("app.services.firebase_resume_service.download_file_bytes", side_effect=mock_download), \
         patch("app.services.firebase_resume_service.FirestoreRepository", side_effect=MockRepo):

        resume_service = FirebaseResumeService()

        # User A uploads resume
        result = await resume_service.process_resume_upload(
            user_id="user_A",
            file_bytes=valid_pdf_content,
            original_filename="alex_resume.pdf",
            target_skills=["Python", "FastAPI", "Docker"],
        )

        assert result["resume"]["userId"] == "user_A"
        resume_id = result["resume"]["resumeId"]
        assert result["analysis"]["atsScore"] >= 0.0

        # User A retrieves own resume
        retrieved = resume_service.get_user_resume_analysis(user_id="user_A", resume_id=resume_id)
        assert retrieved["resume"]["userId"] == "user_A"

        # NEGATIVE SECURITY TEST: User B attempts to access User A's resume
        with pytest.raises(PermissionDeniedError, match="User A cannot retrieve User B's resume"):
            resume_service.get_user_resume_analysis(user_id="user_B", resume_id=resume_id)



# ==========================================================
# 4. ROADMAP CROSS-USER PERMISSION TESTS
# ==========================================================

def test_cross_user_roadmap_access_denied():
    """Security test: User A must NOT be able to modify or toggle User B's roadmap items."""
    roadmap_service = FirebaseRoadmapService()

    # Seed mock item owned by User B
    db_items = {
        "item_b_1": {
            "id": "item_b_1",
            "roadmapId": "user_B_car1",
            "userId": "user_B",
            "tasks": [{"id": "t1", "text": "Learn Docker", "done": False}],
            "isCompleted": False,
        }
    }

    mock_repo = MagicMock()
    mock_repo.get = lambda item_id: db_items.get(item_id)
    roadmap_service.items_repo = mock_repo

    # User A tries to modify User B's milestone
    with pytest.raises(PermissionDeniedError, match="You do not own this roadmap item"):
        roadmap_service.update_task_progress(user_id="user_A", item_id="item_b_1", task_id="t1", completed=True)


# ==========================================================
# 5. ADMIN AUTHORIZATION TESTS
# ==========================================================

@pytest.mark.asyncio
async def test_admin_authorization_enforced():
    """Security test: Normal USER must NOT access ADMIN resources."""
    user_principal = FirebaseUserWrapper(uid="user_norm", email="norm@example.com", role=Role.USER)
    admin_principal = FirebaseUserWrapper(uid="user_admin", email="admin@example.com", role=Role.ADMIN)

    # Admin access allowed
    verified_admin = await get_current_admin(current_user=admin_principal)
    assert verified_admin.role == Role.ADMIN

    # Normal user access rejected with HTTP 403 / PermissionDeniedError
    with pytest.raises(PermissionDeniedError, match="Administrative privileges required"):
        await get_current_admin(current_user=user_principal)
