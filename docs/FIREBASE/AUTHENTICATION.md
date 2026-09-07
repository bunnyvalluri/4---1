# 🔑 Firebase Authentication & Token Verification

## 1. Overview
Identity management is delegated to Firebase Authentication. The client authenticates using the Firebase Web SDK and receives a cryptographically signed Firebase ID token (JWT).

---

## 2. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Frontend Client
    participant FBAuth as Firebase Auth
    participant API as FastAPI Backend
    participant AdminSDK as firebase-admin SDK
    participant Firestore as Cloud Firestore

    Candidate->>FBAuth: signInWithEmailAndPassword(email, password)
    FBAuth-->>Candidate: Return UserCredential & Firebase ID Token
    Candidate->>API: GET /api/v1/recommendations (Header: Bearer <ID_TOKEN>)
    API->>AdminSDK: auth.verify_id_token(token)
    AdminSDK-->>API: Decoded Claims {uid, email, role}
    API->>Firestore: Verify / Sync users/{uid}
    API-->>Candidate: HTTP 200 OK + Data
```

---

## 3. Python Verification Implementation
Located in `backend/app/firebase/auth.py`:

```python
from firebase_admin import auth
from app.core.exceptions import AuthenticationError

def verify_firebase_token(id_token: str) -> dict:
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise AuthenticationError("Firebase ID token has expired.")
    except auth.InvalidIdTokenError:
        raise AuthenticationError("Invalid Firebase ID token.")
```

---

## 4. Role-Based Access Control (RBAC)
Custom claims are assigned to denote administrator privileges:
```python
auth.set_custom_user_claims(uid, {"role": "ADMIN"})
```
The FastAPI dependency `get_current_admin` verifies `token.role == "ADMIN"` before granting access to telemetry or catalog mutations.
