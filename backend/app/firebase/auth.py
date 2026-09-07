from typing import Any, Dict, Optional
import firebase_admin
from firebase_admin import auth
from app.firebase.admin import get_firebase_app
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.logging import logger


def verify_firebase_token(id_token: str, check_revoked: bool = False) -> Dict[str, Any]:
    """
    Verifies a Firebase ID token sent from the frontend.
    Extracts the verified UID, email, and custom claims (e.g. role).
    Never trusts client-supplied user identifiers.
    """
    if not id_token:
        raise AuthenticationError("Authorization token required.")

    # Strip 'Bearer ' prefix if present
    if id_token.startswith("Bearer "):
        id_token = id_token.split("Bearer ")[1].strip()

    # Ensure Firebase is initialized
    get_firebase_app()

    try:
        decoded_token = auth.verify_id_token(id_token, check_revoked=check_revoked)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise AuthenticationError("Firebase ID token has expired. Please refresh credentials.")
    except auth.RevokedIdTokenError:
        raise AuthenticationError("Firebase ID token has been revoked.")
    except auth.InvalidIdTokenError as e:
        raise AuthenticationError(f"Invalid Firebase ID token: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected token verification error: {e}")
        raise AuthenticationError("Failed to verify authentication credentials.")


def get_firebase_user(uid: str) -> auth.UserRecord:
    """Retrieves the user record from Firebase Authentication."""
    get_firebase_app()
    try:
        return auth.get_user(uid)
    except auth.UserNotFoundError:
        raise AuthenticationError(f"User with UID {uid} not found in Firebase.")
    except Exception as e:
        logger.error(f"Error fetching Firebase user: {e}")
        raise AuthenticationError("Failed to retrieve user record.")


def set_user_role(uid: str, role: str) -> None:
    """Sets custom role claim on a Firebase user account (e.g., 'ADMIN' or 'USER')."""
    get_firebase_app()
    try:
        auth.set_custom_user_claims(uid, {"role": role.upper()})
        logger.info(f"Updated Firebase custom claim role for {uid} to {role}")
    except Exception as e:
        logger.error(f"Failed to set custom claim role: {e}")
        raise PermissionDeniedError("Could not update user role claims.")


def create_firebase_user(email: str, password: str, display_name: Optional[str] = None) -> auth.UserRecord:
    """Creates a new user in Firebase Auth directly from backend if needed."""
    get_firebase_app()
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
            email_verified=False,
        )
        return user
    except auth.EmailAlreadyExistsError:
        raise AuthenticationError("A user with this email address already exists.")
    except Exception as e:
        logger.error(f"Failed to create Firebase user: {e}")
        raise AuthenticationError(f"User registration failed: {str(e)}")
