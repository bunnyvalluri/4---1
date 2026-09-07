# 🗄️ Database Architecture & Setup

## 1. Database Philosophy
CareerAI relies on a relational database architecture to maintain referential integrity across users, skill evaluations, aptitude assessments, career requirements, and curricula roadmaps.

---

## 2. Engine & Driver Selection
- **Production**: PostgreSQL 16+ using the high-performance async driver **`asyncpg`**.
- **Development / CI**: SQLite via **`aiosqlite`** with full relational compatibility.
- **Connection URL Format**:
  - PostgreSQL: `postgresql+asyncpg://user:password@host:5432/dbname`
  - SQLite: `sqlite+aiosqlite:///./career_guidance.db`

---

## 3. Connection Pooling Configuration
In `backend/app/db/database.py`:
- `pool_size`: 20 connections
- `max_overflow`: 10 connections
- `pool_pre_ping`: True (automatically recycles disconnected sockets)
- `pool_recycle`: 3600 seconds
