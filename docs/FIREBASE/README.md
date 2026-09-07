# 🔥 Firebase Managed Data Infrastructure

Welcome to the central technical documentation for CareerAI's production **Firebase Infrastructure**.

CareerAI utilizes Firebase as its primary managed data infrastructure across identity, database persistence, and binary storage while maintaining a **100% Python ASGI backend** powered by **FastAPI** and the official **`firebase-admin`** SDK.

---

## 🧭 Firebase Documentation Index

- [Project Setup](./PROJECT_SETUP.md) — Production Firebase project creation, environments, service account security.
- [Authentication](./AUTHENTICATION.md) — Identity management, token verification, custom claims, and RBAC.
- [Firestore Architecture](./FIRESTORE.md) — Cloud Firestore design principles, concurrency, and repository patterns.
- [Data Model & Schema](./DATA_MODEL.md) — Detailed schema definition for all 25+ Firestore collections.
- [Cloud Storage](./STORAGE.md) — Resume and media storage pipeline, magic byte verification, and access paths.
- [Security Rules](./SECURITY_RULES.md) — Production-grade `firestore.rules` and `storage.rules`.
- [Indexes](./INDEXES.md) — Composite query indexes defined in `firestore.indexes.json`.
- [Local Emulator Suite](./LOCAL_EMULATOR.md) — Offline local development using Firebase Emulators.
- [Backup & Disaster Recovery](./BACKUP_AND_RECOVERY.md) — Automated Firestore export to Google Cloud Storage.
- [Monitoring & Observability](./MONITORING.md) — Firebase Console, Cloud Audit Logs, and latency metrics.
- [Troubleshooting](./TROUBLESHOOTING.md) — Common deployment, authorization, and pipeline errors and remediations.

---

## ⚡ Architectural Principles

1. **100% Python Backend**: All business logic, scoring equations, resume parsing (PyMuPDF), and AI orchestration reside in the FastAPI Python backend. No Node.js backend or Firebase Functions are used.
2. **Never Trust Client Identifiers**: The backend never accepts or trusts client-supplied user IDs. All authenticated requests must pass a Firebase ID token in `Authorization: Bearer <id_token>`, which is verified via `firebase_admin.auth.verify_id_token`.
3. **Firestore as Primary Database**: Cloud Firestore is the single source of truth for application state.
4. **Zero Secrets in Git**: Service account credentials and private keys are injected exclusively via environment variables (`FIREBASE_PRIVATE_KEY`, etc.) or external secret managers.
