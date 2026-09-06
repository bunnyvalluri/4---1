# CareerAI: AI-Powered Personalized Career Guidance Platform

A complete, production-grade full-stack platform built with Next.js, React 19, Python Machine Learning, PostgreSQL (Prisma), and Google Gemini AI.

---

## 📁 Repository Directory Structure

```
├── 📁 frontend/     # Client UI, Components, Layouts & Theme System
│   ├── components/  # Navbar, Footer, Sidebar, Radar Charts, UI Cards
│   ├── globals.css  # Strict Light/White Theme Design Tokens
│   └── README.md    # Frontend Architecture Guide
│
├── 📁 backend/      # Server Logic, ML Pipeline, AI Engine & APIs
│   ├── ml/          # Python scikit-learn, pandas, numpy Recommender
│   ├── ai/          # LLM Abstraction, Embeddings, RAG Service
│   ├── auth.ts      # Authentication & JWT Security
│   ├── db.ts        # Prisma PostgreSQL Singleton Client
│   ├── tests/       # End-to-End & ML Unit Test Suites
│   └── README.md    # Backend Architecture Guide
│
├── 📁 database/     # Database Schema, Relational Models & Seeds
│   ├── schema.prisma# PostgreSQL Database Schema
│   ├── seed.ts      # Seed script (20 Careers, 79 Skills, 25 Questions)
│   └── README.md    # Database Setup Guide
│
├── 📁 docs/         # Comprehensive Technical Documentation
│   ├── ARCHITECTURE.md       # High-Level System Architecture
│   ├── API_DOCUMENTATION.md  # All 15+ REST API Endpoints
│   ├── MACHINE_LEARNING.md   # Python ML Mathematical Formulation & Pipeline
│   ├── RAG_AND_EMBEDDINGS.md # Retrieval-Augmented Generation & Vector Search
│   ├── DATABASE_SCHEMA.md    # Relational Data Models & Indexing
│   ├── AGENTS.md             # Developer Agent Rules
│   └── CLAUDE.md             # Project Configuration
│
├── 📁 public/       # Static Visual Assets & SVG Icons
├── 📁 src/          # Next.js App Router Page Routes & API Handlers
├── 📄 package.json  # NPM Dependencies & Build Scripts
└── 📄 tsconfig.json # TypeScript Path Mappings (@/frontend, @/backend, @/database)
```

---

## 🌟 Key Features

1. **Strict Light / White Theme Only**: Pure `#FFFFFF` and `#F8FAFC` clean aesthetic with `#2563EB` blue accents. Zero dark mode.
2. **Dual-Model ML Recommendation Engine**:
   - Python `scikit-learn`, `pandas`, and `numpy` inference via high-performance IPC bridge.
   - Transparent 7-factor explainability scoring.
3. **Retrieval-Augmented Generation (RAG)**: Aura AI Assistant grounded in career knowledge vectors with explicit citations.
4. **Cognitive Assessment**: Diagnostic tests measuring 5 cognitive abilities.
5. **Interactive 6-Month Roadmap**: Dynamic milestones with task completion tracking.
6. **Real Resume ATS Parser**: PDF & DOCX extraction with keyword matching and bullet-point rewrites.
7. **Enterprise Admin Portal**: Telemetry, user role management, career catalog, and question bank CRUD.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Database setup & seeding
npx prisma db push
npx prisma db seed

# 3. Start local development server
npm run dev

# 4. Run automated test suites
python -m unittest backend/ml/test_ml_engine.py
npx tsx src/tests/testAIMLSubsystems.test.ts
npx tsx src/tests/e2eFullWorkflow.test.ts
```
