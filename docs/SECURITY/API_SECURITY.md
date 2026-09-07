# 🌐 API Security & Hardening

## 1. CORS Configuration
Strict origin whitelisting in `backend/app/core/config.py`:
- Permitted origins: Local Next.js port (`http://localhost:3000`) and configured production domains.
- Wildcards (`*`) are strictly prohibited when credentials are true.

---

## 2. Input Validation (Pydantic v2)
Every request payload is validated against strongly typed Pydantic models before reaching route handlers. Malformed inputs are rejected with `422 Unprocessable Entity`.

---

## 3. SQL Injection Prevention
All database queries use SQLAlchemy 2.0 type-safe expressions or parameterized statements. Raw SQL string concatenation is forbidden.
