"""
CLI utility to set Firebase custom claims for an administrator.
Usage:
    uv run python scripts/set_admin_claim.py <email_or_uid> [--role admin|candidate]
"""

import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.firebase.admin import get_firebase_app
from app.firebase.auth import set_user_role, get_firebase_user
from firebase_admin import auth
from app.firebase.firestore import FirestoreRepository, FirestoreCollections


def main():
    parser = argparse.ArgumentParser(description="Assign Firebase Custom Claims for Role-Based Access")
    parser.add_argument("identifier", help="User Email or Firebase UID")
    parser.add_argument("--role", choices=["admin", "candidate"], default="admin", help="Role to assign")
    args = parser.parse_args()

    get_firebase_app()

    identifier = args.identifier.strip()
    role = args.role.lower()

    uid = None
    try:
        if "@" in identifier:
            user = auth.get_user_by_email(identifier)
            uid = user.uid
        else:
            user = auth.get_user(identifier)
            uid = user.uid
    except Exception as e:
        print(f"Error finding user '{identifier}': {e}")
        sys.exit(1)

    # 1. Set Custom Claims in Firebase Auth
    try:
        auth.set_custom_user_claims(uid, {"role": role})
        print(f"Successfully set custom claim 'role: {role}' for user UID: {uid} ({user.email})")
    except Exception as e:
        print(f"Error setting Firebase custom claim: {e}")
        sys.exit(1)

    # 2. Synchronize Firestore users document
    try:
        repo = FirestoreRepository(FirestoreCollections.USERS)
        existing = repo.get(uid) or {}
        existing["role"] = role
        existing["updatedAt"] = "2026-09-08T18:42:00Z"
        repo.set(uid, existing)
        print(f"Synchronized Firestore users/{uid} document with role: {role}")
    except Exception as e:
        print(f"Warning: Could not update Firestore user doc: {e}")

    print("\nDone. The user must re-authenticate (or refresh token) to receive updated claims.")


if __name__ == "__main__":
    main()
