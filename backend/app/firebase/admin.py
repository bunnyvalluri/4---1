import os
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from app.core.config import settings
from app.core.logging import logger

_firebase_app: Optional[firebase_admin.App] = None


def initialize_firebase() -> firebase_admin.App:
    """
    Initializes the Firebase Admin SDK exactly once during application startup.
    Resolves credentials via file path, environment variables, or emulator configuration.
    """
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    # Check if already initialized by another module or test harness
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass

    # Configure local emulators if specified
    if settings.USE_FIREBASE_EMULATOR or settings.FIRESTORE_EMULATOR_HOST:
        if settings.FIRESTORE_EMULATOR_HOST:
            os.environ["FIRESTORE_EMULATOR_HOST"] = settings.FIRESTORE_EMULATOR_HOST
            logger.info(f"Using Firestore Emulator at {settings.FIRESTORE_EMULATOR_HOST}")
        if settings.FIREBASE_AUTH_EMULATOR_HOST:
            os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = settings.FIREBASE_AUTH_EMULATOR_HOST
            logger.info(f"Using Firebase Auth Emulator at {settings.FIREBASE_AUTH_EMULATOR_HOST}")
        if settings.FIREBASE_STORAGE_EMULATOR_HOST:
            os.environ["STORAGE_EMULATOR_HOST"] = settings.FIREBASE_STORAGE_EMULATOR_HOST
            logger.info(f"Using Firebase Storage Emulator at {settings.FIREBASE_STORAGE_EMULATOR_HOST}")

    cred = None

    # 1. From local JSON credentials file
    if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        logger.info(f"Initializing Firebase Admin with credentials file: {settings.FIREBASE_CREDENTIALS_PATH}")
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)

    # 2. From raw environment variables
    elif settings.FIREBASE_CLIENT_EMAIL and settings.FIREBASE_PRIVATE_KEY:
        logger.info("Initializing Firebase Admin with environment variable credentials")
        private_key = settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n")
        cred_dict = {
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key": private_key,
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        cred = credentials.Certificate(cred_dict)

    # 3. Default Application Credentials / Emulator / Test Mode
    else:
        logger.info(f"Initializing Firebase Admin with Project ID: {settings.FIREBASE_PROJECT_ID}")
        # In testing or emulator mode, default project initialization is supported
        os.environ.setdefault("GCLOUD_PROJECT", settings.FIREBASE_PROJECT_ID)
        os.environ.setdefault("FIREBASE_CONFIG", f'{{"projectId": "{settings.FIREBASE_PROJECT_ID}"}}')
        try:
            cred = credentials.ApplicationDefault()
        except Exception:
            # Fallback for offline testing/emulators
            cred = None

    options = {
        "projectId": settings.FIREBASE_PROJECT_ID,
    }
    if settings.FIREBASE_STORAGE_BUCKET:
        options["storageBucket"] = settings.FIREBASE_STORAGE_BUCKET
    if settings.FIREBASE_DATABASE_URL:
        options["databaseURL"] = settings.FIREBASE_DATABASE_URL

    if cred:
        _firebase_app = firebase_admin.initialize_app(cred, options)
    else:
        _firebase_app = firebase_admin.initialize_app(options=options)

    logger.info("Firebase Admin SDK successfully initialized.")
    return _firebase_app


def get_firebase_app() -> firebase_admin.App:
    """Returns the initialized Firebase App instance."""
    global _firebase_app
    if _firebase_app is None:
        return initialize_firebase()
    return _firebase_app
