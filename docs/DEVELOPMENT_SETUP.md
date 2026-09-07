# 💻 Local Development Setup Guide

## 1. System Prerequisites
Ensure the following tools are installed on your workstation:
- **Python**: `>= 3.12` (Python 3.13 recommended)
- **Node.js**: `>= 18.18` (LTS recommended)
- **PostgreSQL**: `>= 15` (or Docker for database)
- **Git**

---

## 2. Repository Cloning
```bash
git clone https://github.com/your-org/career-guidance.git
cd career-guidance
```

---

## 3. Backend Setup (Python FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install pinned dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create local environment configuration:
   ```bash
   cp .env.example .env
   ```

5. Seed the database with sample careers, 100+ skills, and aptitude questions:
   ```bash
   python scripts/seed_database.py
   ```

6. Launch the FastAPI ASGI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Swagger Documentation: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
   - Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 4. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   - Dashboard: [http://localhost:3000](http://localhost:3000)
