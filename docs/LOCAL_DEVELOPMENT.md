# 💻 Local Development Workflow

## 1. Day-to-Day Workflow
- Run both backend and frontend concurrently in separate terminal sessions.
- Fast reload is enabled by default:
  - Backend: Uvicorn detects file changes in `backend/app/` and reloads within $\sim 800\text{ms}$.
  - Frontend: Next.js Fast Refresh updates components without losing state.

---

## 2. Running Automated Tests
Always execute tests before submitting commits:
```bash
# Run pytest suite
python -m pytest backend/tests -v

# Run with coverage report
python -m pytest backend/tests --cov=backend/app --cov-report=term-missing
```

---

## 3. Database Resetting & Reseeding
To reset your local SQLite or PostgreSQL test database:
```bash
# Delete SQLite database file if working locally
rm backend/career_guidance.db

# Reseed complete taxonomy
python backend/scripts/seed_database.py
```
Default accounts created during seeding:
- **Admin**: `admin@careerai.dev` / `admin123`
- **Candidate**: `alex@example.com` / `password123`
