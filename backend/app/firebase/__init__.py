"""
Firebase Integration Module for CareerAI Backend.
Provides initialization, authentication, Firestore client, and Storage handlers.
"""

from app.firebase.admin import get_firebase_app, initialize_firebase
from app.firebase.auth import verify_firebase_token, get_firebase_user
from app.firebase.firestore import get_firestore_client, FirestoreCollections
from app.firebase.storage import get_storage_bucket, upload_file_bytes, download_file_bytes

__all__ = [
    "get_firebase_app",
    "initialize_firebase",
    "verify_firebase_token",
    "get_firebase_user",
    "get_firestore_client",
    "FirestoreCollections",
    "get_storage_bucket",
    "upload_file_bytes",
    "download_file_bytes",
]
