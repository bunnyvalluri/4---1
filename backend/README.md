# AI Career Guidance Backend (100% Python)

High-performance, production-ready asynchronous backend built with **Python 3.12+**, **FastAPI**, **SQLAlchemy 2.0 (Async)**, **Pydantic v2**, **Alembic**, **Scikit-learn**, **PyMuPDF**, and **Pytest**.

---

## Architecture Overview

```
Frontend (Next.js / TypeScript)
      │
      ▼ HTTP REST / Server-Sent Events (SSE)
FastAPI Application (app.main:app)
      │
      ├─► Core Layer (Config, Security, JWT/Argon2, Logging, Domain Exceptions)
      ├─► API Routers v1:
      │     ├─ /auth             - Registration, JWT Login, Profile retrieval
      │     ├─ /users            - Account & User administration
      │     ├─ /profile          - Candidate education, career goals, preferences
      │     ├─ /skills           - Catalog of skills & User proficiency tracking
      │     ├─ /assessment       - Aptitude questions, scoring & analytics
      │     ├─ /careers          - Career profiles, requirements & benchmarks
      │     ├─ /recommendations  - Multi-factor ML career recommendations & skill gaps
      │     ├─ /roadmap          - Dynamic month-by-month milestone generation & task tracking
      │     ├─ /projects         - Portfolio projects tailored to skill gaps
      │     ├─ /resume           - PDF/DOCX parsing (PyMuPDF), ATS scoring & optimization
      │     ├─ /assistant        - AI career guidance chat (REST & SSE streaming)
      │     ├─ /notifications    - In-app notification alerts
      │     └─ /admin            - Administrative platform health & telemetry
      │
      ├─► Service Layer (Business Logic Orchestration)
      ├─► ML & AI Engines:
      │     ├─ Scikit-learn Multi-Factor Scoring (Skills 40%, Aptitude 25%, Interests 20%, Experience 15%)
      │     ├─ TF-IDF & Cosine Similarity Semantic Matching
      │     ├─ Rule-Based & Gemini Generative AI Reasoning
      │     └─ PyMuPDF / python-docx ATS Resume Extraction & Audit
      │
      └─► Repository Layer (Async SQLAlchemy 2.0 Queries)
            │
            ▼
      PostgreSQL / Async SQLAlchemy Engine
```

---

## Getting Started

### Prerequisites

- Python `>= 3.12`
- `uv` (recommended) or standard `pip`

### 1. Environment Setup

```bash
cd backend
cp .env.example .env
```

### 2. Dependency Installation

Using `uv` (recommended):
```bash
uv pip install -r requirements.txt
```

Or using standard `pip`:
```bash
pip install -r requirements.txt
```

### 3. Database Initialization & Seeding

Run the master Python seed script to create tables and load rich production-quality seed data:
```bash
python scripts/seed_database.py
```

This sets up:
- **System Administrator**: `admin@careerai.dev` / `Admin@123456`
- **Demo Candidate**: `alex@example.com` / `Password@123`
- **100+ Categorized Skills**
- **Aptitude Questions Catalog**
- **Career Benchmarks & Project Suggestions**
- **Pre-computed Recommendations & Roadmaps**

### 4. Running the Development Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/api/v1/redoc](http://127.0.0.1:8000/api/v1/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## Testing

Run the comprehensive pytest test suite:
```bash
python -m pytest tests -v
```

All tests execute asynchronously against an isolated in-memory SQLite database without requiring a running external database server.
