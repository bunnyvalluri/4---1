# 📁 Firebase Cloud Storage Architecture

## 1. Storage Architecture & Path Hierarchy
All user binary files are persisted in Firebase Cloud Storage according to an immutable user-prefixed hierarchy:

```
gs://careerai-production.appspot.com/
└── users/
    └── {userId}/
        ├── resumes/
        │   └── {resumeId}/
        │       └── original.pdf (or .docx)
        ├── profile/
        │   └── avatar.png
        └── projects/
            └── {projectId}/
                └── architecture-spec.pdf
```

---

## 2. Validation & Security Pipeline
Located in `backend/app/firebase/storage.py`:

```
Client File Upload (Multipart Form Data)
                  │
                  ▼
   1. Inspect Magic Bytes
      • PDF (%PDF-)
      • DOCX (PK)
      • Reject fake extensions
                  │
                  ▼
   2. Size Guard
      • Resumes ≤ 10 MB
      • Avatars ≤ 5 MB
                  │
                  ▼
   3. Write to Cloud Storage
      • Path: users/{userId}/resumes/{resumeId}/original
                  │
                  ▼
   4. Secure Retrieval & PyMuPDF Parsing
                  │
                  ▼
   5. ATS Analysis & Firestore Persistence
```

---

## 3. Storage Security Rules
Rules enforce strict UID boundaries:
```javascript
match /users/{userId}/resumes/{resumeId}/{fileName} {
  allow read: if request.auth.uid == userId || request.auth.token.role == 'ADMIN';
  allow write: if request.auth.uid == userId &&
                  request.resource.size <= 10 * 1024 * 1024;
}
```
