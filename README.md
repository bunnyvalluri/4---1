# CareerAI: AI-Powered Personalized Career Guidance & Skill Roadmap Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![pandas](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Theme](https://img.shields.io/badge/Theme-Strict_Light_Only-3B82F6?style=for-the-badge)

**A production-grade, transparent career advisory and skill development ecosystem powered by dual-engine Python Machine Learning and generative Retrieval-Augmented Generation (RAG).**

[Live Demo](http://localhost:3000) • [Architecture Docs](./docs/ARCHITECTURE.md) • [API Reference](./docs/API_DOCUMENTATION.md) • [ML Formulation](./docs/MACHINE_LEARNING.md)

</div>

---

## 📌 Executive Summary

Modern career planning often suffers from opaque black-box recommendations, disconnected job descriptions, and generic advice. **CareerAI** bridges this gap by delivering an explainable, data-driven platform that diagnoses candidate cognitive aptitude, evaluates verified technical skills, extracts resume intelligence, and synthesizes dynamic, 6-month interactive learning roadmaps.

### Core Architectural Pillars
- **Dual-Model ML Recommendation Engine**: High-performance Python inference engine combining TF-IDF vectorization, dense cosine embeddings, and a supervised Random Forest suitability classifier with granular feature attribution.
- **Retrieval-Augmented Generation (RAG)**: Conversational career counselor ("Aura") grounded in vector-indexed career taxonomies, skill benchmarks, and interview playbooks with verifiable citations.
- **Cognitive Psychometric Diagnostics**: One-question-per-screen assessment system evaluating 5 core cognitive dimensions (Logical, Quantitative, Verbal, Analytical, Problem Solving).
- **Automated Resume ATS Analyzer**: Real text extraction pipeline for PDF and DOCX files computing keyword density, formatting compliance, and impact-driven bullet rewrites.
- **Enterprise Light / White Design System**: Strictly enforced `#FFFFFF` and `#F8FAFC` high-contrast interface designed for maximum readability and accessibility (zero dark mode toggles).

---

## 🏗️ System Architecture & Workflow

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (Next.js 16 + React 19)"]
        UI["Candidate Portal & Dashboard"]
        Assess["Cognitive Diagnostic UI"]
        Roadmap["Interactive 6-Month Roadmap"]
        ResumeUI["Resume ATS Scanner"]
        ChatUI["Aura AI Advisor (RAG)"]
        AdminUI["Platform Governance & Telemetry"]
    end

    subgraph Server["Backend & APIs (Node.js Runtime)"]
        Router["App Router API Handlers"]
        Auth["JWT & bcryptjs Security"]
        IPC["Node.js Subprocess IPC Bridge"]
        LLM["LLM Provider Abstraction Layer"]
        RAG["Vector Search & RAG Service"]
    end

    subgraph ML["Machine Learning Pipeline (Python 3.13)"]
        FeatEng["Feature Engineering (pandas & numpy)"]
        TFIDF["TF-IDF & Dense Embeddings (scikit-learn)"]
        RF["Random Forest Suitability Classifier"]
        Attribution["6-Factor Attribution Decomposition"]
    end

    subgraph Data["Database Layer (PostgreSQL)"]
        Prisma["Prisma ORM (14 Relational Models)"]
        DB[(PostgreSQL Database)]
    end

    UI --> Router
    Assess --> Router
    ResumeUI --> Router
    ChatUI --> Router

    Router --> Auth
    Router --> Prisma
    Router --> IPC
    Router --> LLM
    Router --> RAG

    IPC --> FeatEng
    FeatEng --> TFIDF
    FeatEng --> RF
    RF --> Attribution
    Attribution --> IPC

    Prisma --> DB
    RAG --> DB
```

---

## 📁 Repository Directory Structure

The codebase is organized into decoupled, production-ready architectural layers:

```
c:\4-1\
├── 📁 frontend/                # Client Application & UI Design System
│   ├── src/app/                # Next.js App Router Pages & API Route Handlers
│   ├── src/components/layout/  # Navbar, Footer, Sidebar, Radar Visualizations
│   ├── src/globals.css         # Strict Light/White Theme Design Tokens
│   ├── public/                 # Static Assets, SVGs, and Platform Icons
│   ├── next.config.ts          # Turbopack Configuration
│   ├── tsconfig.json           # Path Mappings (@/frontend, @/backend, @/database)
│   └── package.json            # Frontend Dependencies & Scripts
│
├── 📁 backend/                 # Machine Learning & AI Core Subsystems
│   ├── ml/                     # Python scikit-learn, pandas, and numpy Pipeline
│   │   ├── career_recommender.py # High-Speed Inference Engine & IPC CLI
│   │   ├── train_models.py       # Supervised Random Forest Training Pipeline
│   │   ├── test_ml_engine.py     # Python Unit Test Suite (3/3 Passed)
│   │   └── models/               # Serialized .joblib Model Artifacts
│   ├── ai/                     # Multi-Provider LLM & Vector Retrieval
│   │   ├── llmProvider.ts        # Unified LLM Interface (Gemini, OpenAI, Fallback)
│   │   ├── embeddings.ts         # Dense Vector Embeddings & Cosine Distance
│   │   └── ragService.ts         # Vector Indexing & Context-Grounded Answering
│   ├── auth.ts                 # JWT Session Tokens & Role Guards
│   ├── db.ts                   # Prisma Singleton Client
│   ├── pythonBridge.ts         # Subprocess IPC Bridge connecting Node.js with Python
│   └── tests/                  # Backend & Subsystem Test Suites
│
├── 📁 database/                # Database Schema & Relational Models
│   ├── schema.prisma           # PostgreSQL Relational Schema (14 Models)
│   ├── seed.ts                 # Seeding Data (20 Careers, 79 Skills, 25 Questions)
│   └── README.md               # Database Architecture & Entity Guide
│
├── 📁 docs/                    # Technical Architecture & Developer Guides
│   ├── ARCHITECTURE.md         # Full-Stack System Architecture Overview
│   ├── API_DOCUMENTATION.md    # Complete 15+ REST API Endpoint Reference
│   ├── MACHINE_LEARNING.md     # Python ML Mathematical Formulation & Features
│   ├── RAG_AND_EMBEDDINGS.md   # Retrieval-Augmented Generation & Vector Retrieval
│   ├── DATABASE_SCHEMA.md      # Database Relational Models & Indexing
│   ├── CLAUDE.md               # Tooling & Workspace Rules
│   └── AGENTS.md               # Developer Agent Verification Directives
│
├── 📄 .env                     # Local Environment Secrets (PostgreSQL, JWT, Gemini)
├── 📄 .env.example             # Documented Template for Environment Variables
├── 📄 .gitignore               # Ignored Build Directories & Artifacts
├── 📄 package.json             # Root Orchestrator (npm run dev, npm test, npm run build)
└── 📄 README.md                # Project Overview & Quick Start Guide
```

---

## 🔬 Machine Learning & Explainability

CareerAI rejects opaque black-box recommendations. Every career match is generated through a mathematically grounded multi-criteria scoring algorithm:

$$\text{MatchScore} = 0.28(S_{\text{skills}}) + 0.16(S_{\text{interests}}) + 0.16(S_{\text{aptitude}}) + 0.12(S_{\text{education}}) + 0.10(S_{\text{experience}}) + 0.10(S_{\text{preferences}}) + 0.08(S_{\text{resume}})$$

### Factor Breakdown & Attribution
| Factor | Weight | Evaluation Method |
| :--- | :---: | :--- |
| **Verified Skills Overlap** | **28%** | Jaccard & transfer-weighted overlap between candidate verified skills and required core skills. |
| **Semantic Interest Fit** | **16%** | TF-IDF n-gram vectorization and cosine similarity against discipline descriptions. |
| **Cognitive Aptitude Alignment** | **16%** | Euclidean distance penalty against 5-axis cognitive benchmark vectors. |
| **Education Tier Compatibility** | **12%** | Degree tier classification matching candidate level to target role prerequisites. |
| **Practical Experience Match** | **10%** | Seniority curve mapping candidate experience years to career demand level. |
| **Career Role & Work Style** | **10%** | Exact and sub-term matching across target roles, industry passions, and work styles. |
| **Resume Empirical Evidence** | **8%** | Corroboration rate of extracted resume skills against target domain requirements. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Python**: `v3.10` or higher (tested on `Python 3.13`)
- **PostgreSQL**: Local instance or hosted connection (e.g. Supabase, Neon)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/bunnyvalluri/4---1.git
cd 4---1

# Install frontend and backend dependencies
npm install

# Verify Python ML dependencies (scikit-learn, pandas, numpy, joblib)
python -m pip install scikit-learn pandas numpy joblib
```

### 3. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/career_guidance_db?schema=public"
JWT_SECRET="your-strong-random-jwt-secret-key-2026"
GEMINI_API_KEY="your-google-gemini-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Database Initialization & Seeding
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed 20 careers, 79 skills, and 25 diagnostic questions
npx prisma db seed
```

### 5. Launch Development Server
```bash
# Start Next.js development server (runs with Turbopack)
npm run dev
```
Navigate to **`http://localhost:3000`** in your browser.

---

## 🧪 Comprehensive Automated Test Matrix

CareerAI enforces continuous verification across both Python and TypeScript runtimes:

```bash
# Run all test suites simultaneously (Python ML, AI RAG, and E2E Workflow)
npm test
```

### Breakdown of Test Suites
| Suite | Runtime | Scope | Result |
| :--- | :---: | :--- | :---: |
| `backend/ml/test_ml_engine.py` | Python 3.13 | scikit-learn TF-IDF, Cosine Similarity & Random Forest Persona Ranking | **3/3 Passed (100%)** |
| `frontend/src/tests/testAIMLSubsystems.test.ts` | Node.js / TS | Python IPC Bridge, LLM Abstraction, Embeddings, RAG Vector Citations | **15/15 Passed (100%)** |
| `frontend/src/tests/recommendationEngine.test.ts` | Node.js / TS | 6 Distinct Candidate Personas & Cold-Start Robustness Verification | **16/16 Passed (100%)** |
| `frontend/src/tests/e2eFullWorkflow.test.ts` | Node.js / TS | Auth, Onboarding, Diagnostics, Hybrid ML, Roadmap, ATS, Admin Telemetry | **38/38 Passed (100%)** |
| **Total Automated Assertions** | | **Comprehensive System Validation** | **72/72 Passed (100%)** |

### Production Build Validation
```bash
npm run build
```
✓ Compiles all **41/41 static and dynamic routes** with Turbopack and strict TypeScript checking in under 2 seconds.

---

## 🔐 Enterprise Security & Platform Governance

- **Authentication**: Salted `bcryptjs` password encryption with signed JWT cookies (`SameSite: Lax`, `HttpOnly`).
- **Role-Based Access Control (RBAC)**: Administrative portal (`/admin`) guarded by server-side role verifications (`ADMIN` vs `USER`).
- **High-Availability AI**: 3000ms `AbortSignal` timeouts with automatic cascade fallback to local deterministic models ensuring 100% platform uptime.
- **Sanitized Parser Pipeline**: Memory-safe parsing for PDF (`pdf-parse`) and DOCX (`mammoth`) files without remote execution vulnerabilities.

---

## 📄 Documentation Sitemap

For in-depth technical specifications, explore our dedicated documentation suite:
- 📘 [Full-Stack Architecture Guide](./docs/ARCHITECTURE.md)
- 🔌 [REST API Specifications](./docs/API_DOCUMENTATION.md)
- 🧠 [Machine Learning Formulation](./docs/MACHINE_LEARNING.md)
- 🤖 [Retrieval-Augmented Generation & Vector Search](./docs/RAG_AND_EMBEDDINGS.md)
- 🗄️ [Database Entity Models & Indexing](./docs/DATABASE_SCHEMA.md)

---

## 👥 Contributors & License

- **Developer**: Rahul Valluri ([@bunnyvalluri](https://github.com/bunnyvalluri))
- **Repository**: [https://github.com/bunnyvalluri/4---1.git](https://github.com/bunnyvalluri/4---1.git)
- **License**: MIT License. Open-source educational and enterprise career guidance platform.
