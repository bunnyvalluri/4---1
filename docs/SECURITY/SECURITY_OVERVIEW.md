# 🛡️ Security Architecture Overview

CareerAI adheres to strict defense-in-depth security principles across all layers: network ingress, application logic, data persistence, and AI model orchestration.

## 🧭 Security Documentation Directory
- [Authentication](./AUTHENTICATION.md) — Salted Bcrypt hashing, JWT issuance, and session lifecycles.
- [Authorization & RBAC](./AUTHORIZATION.md) — Role-based access control (`USER` vs `ADMIN`).
- [API Security](./API_SECURITY.md) — Rate limiting, CORS, input sanitization, and headers.
- [File Upload Security](./FILE_UPLOAD_SECURITY.md) — PDF/DOCX validation, magic byte checks, and memory limits.
- [AI Security](./AI_SECURITY.md) — Prompt injection defense, data leakage controls, and safe fallbacks.
- [Data Privacy & Compliance](./DATA_PRIVACY.md) — Data retention, GDPR rights, and PII anonymization.
- [Security Checklist](./SECURITY_CHECKLIST.md) — Production deployment readiness verification checklist.
