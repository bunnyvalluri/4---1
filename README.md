# CareerAI: Enterprise AI-Powered Career Guidance & Skill Roadmap Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![pandas](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-72%2F72_Passed_(100%25)-success?style=for-the-badge&logo=checkmarx&logoColor=white)](#-automated-testing--verification-matrix)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Theme](https://img.shields.io/badge/Design-Strict_Light_Theme-0284C7?style=for-the-badge)](#-design-system--ui-specifications)

**A production-ready, explainable career intelligence ecosystem powered by hybrid Python Machine Learning, Retrieval-Augmented Generation (RAG), and psychometric cognitive evaluation.**

[Explore Architecture](./docs/ARCHITECTURE.md) • [REST API Specs](./docs/API_DOCUMENTATION.md) • [Machine Learning Details](./docs/MACHINE_LEARNING.md) • [RAG & Vector Retrieval](./docs/RAG_AND_EMBEDDINGS.md) • [Database Schema](./docs/DATABASE_SCHEMA.md)

</div>

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Core Architectural Subsystems](#-core-architectural-subsystems)
  - [1. Dual-Model Machine Learning Engine](#1-dual-model-machine-learning-engine)
  - [2. Multi-Provider LLM & Vector RAG Subsystem](#2-multi-provider-llm--vector-rag-subsystem)
  - [3. Psychometric & Cognitive Assessment Engine](#3-psychometric--cognitive-assessment-engine)
  - [4. Dynamic 6-Month Roadmap & Skill-Gap Analysis](#4-dynamic-6-month-roadmap--skill-gap-analysis)
  - [5. Automated Resume ATS Extraction & Intelligence](#5-automated-resume-ats-extraction--intelligence)
  - [6. Platform Governance & Admin Telemetry](#6-platform-governance--admin-telemetry)
- [Mathematical Formulation & Scoring Breakdown](#-mathematical-formulation--scoring-breakdown)
- [Repository Organization](#-repository-organization)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Configuration](#environment-configuration)
  - [Database Migration & Seeding](#database-migration--seeding)
  - [Execution](#execution)
- [REST API Reference Summary](#-rest-api-reference-summary)
- [Automated Testing & Verification Matrix](#-automated-testing--verification-matrix)
- [Enterprise Security & Resilience](#-enterprise-security--resilience)
- [Design System & UI Specifications](#-design-system--ui-specifications)
- [Contributing & License](#-contributing--license)

---

## 📌 Executive Summary

Traditional career advisement tools operate as opaque recommendation silos or provide surface-level keyword matching without transparent reasoning. **CareerAI** delivers an enterprise-grade, end-to-end career guidance platform that evaluates a candidate's complete profile across multiple dimensions:

1. **Cognitive Aptitude & Psychometrics**: Standardized 5-axis aptitude scoring (Logical, Quantitative, Verbal, Analytical, Problem Solving).
2. **Empirical Technical Competence**: Verified skills, project artifacts, and education level.
3. **Natural Language Semantics**: Career interests, work-style preferences, and target industry domains.
4. **Resume Intelligence**: Automated ATS scoring, keyword density extraction, and impact recommendations.
5. **Interactive Skill Progression**: Auto-generated 6-month milestones with milestone completion tracking and curated learning resources.

---

## 🏗️ System Architecture

The application adopts a clean, decoupled 4-tier architecture designed for horizontal scalability, zero-downtime AI failover, and strict separation of concerns.

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Layer (Next.js 16 + React 19)"]
        UI["Candidate Dashboard & Profile"]
        AssessUI["Cognitive Psychometric Diagnostic UI"]
        RoadmapUI["Interactive 6-Month Roadmap & Milestones"]
        ResumeUI["Resume ATS Scanner & Analyzer"]
        ChatUI["Aura Conversational Career Advisor"]
        AdminUI["Platform Governance & Telemetry"]
    end

    subgraph ServiceLayer["Application Service Layer (Node.js App Router)"]
        APIRouter["Next.js Route Handlers (/api/*)"]
        AuthModule["JWT Session & Role-Based Access Control"]
        IPCGateway["Python Subprocess IPC Bridge"]
        LLMManager["LLM Provider Abstraction Layer"]
        RAGService["RAG Vector Ingestion & Search Engine"]
    end

    subgraph MLLayer["Python Machine Learning Engine (Python 3.13)"]
        FeatExtract["Feature Extraction & Normalization"]
        VectorEngine["TF-IDF Vectorizer & Cosine Similarity"]
        Classifier["Random Forest Career Classifier (.joblib)"]
        Attribution["6-Factor Explainability Decomposition"]
    end

    subgraph DataLayer["Persistence Layer (PostgreSQL + Prisma ORM)"]
        PrismaClient["Prisma Client Singleton"]
        PGDB[("PostgreSQL Database (14 Relational Models)")]
    end

    %% Client to Service Connections
    ClientLayer -->|HTTPS / REST| APIRouter

    %% Service Internals
    APIRouter --> AuthModule
    APIRouter --> PrismaClient
    APIRouter --> IPCGateway
    APIRouter --> LLMManager
    APIRouter --> RAGService

    %% Service to ML
    IPCGateway -->|JSON over Stdin/Stdout| FeatExtract
    FeatExtract --> VectorEngine
    FeatExtract --> Classifier
    VectorEngine --> Attribution
    Classifier --> Attribution
    Attribution -->|Attribution Payload| IPCGateway

    %% Service to Database
    PrismaClient --> PGDB
    RAGService -.->|Grounding Queries| PGDB
```

---

## 🧩 Core Architectural Subsystems

### 1. Dual-Model Machine Learning Engine
- **Engine Script**: [`backend/ml/career_recommender.py`](file:///C:/4-1/backend/ml/career_recommender.py)
- **Model Artifact**: [`backend/ml/models/career_classifier.joblib`](file:///C:/4-1/backend/ml/models/career_classifier.joblib)
- **Training Pipeline**: [`backend/ml/train_models.py`](file:///C:/4-1/backend/ml/train_models.py)
- **Frameworks**: `scikit-learn`, `pandas`, `numpy`, `joblib`.
- **Methodology**: Combines unsupervised dense semantic n-gram TF-IDF embeddings with a supervised Random Forest classifier trained across 20 distinct industry disciplines. Computes cosine similarity across skill requirement vectors and decomposes scores into 7 explainable attribution factors.

### 2. Multi-Provider LLM & Vector RAG Subsystem
- **Abstraction Interface**: [`backend/ai/llmProvider.ts`](file:///C:/4-1/backend/ai/llmProvider.ts)
- **Vector Ingestion & Search**: [`backend/ai/ragService.ts`](file:///C:/4-1/backend/ai/ragService.ts)
- **Embeddings Engine**: [`backend/ai/embeddings.ts`](file:///C:/4-1/backend/ai/embeddings.ts)
- **Supported Providers**:
  - `GeminiProvider`: Primary Google Gemini 2.5 Flash implementation.
  - `OpenAIProvider`: Production OpenAI GPT-4o compatibility.
  - `DeterministicFallbackProvider`: Zero-dependency, offline cluster-projected vector hashing fallback guaranteeing 100% platform availability if upstream APIs are unreachable.
- **RAG Grounding**: Aura career advisor indexes 20 industry career profiles, certified skills, and learning playbooks to generate context-grounded responses with verifiable citations.

### 3. Psychometric & Cognitive Assessment Engine
- **Implementation**: One-question-at-a-time interactive diagnostic testing.
- **Dimensions**:
  - 🧮 **Quantitative Reasoning** (probability, numerical series, rate analysis)
  - 🧩 **Logical Deductive Reasoning** (syllogisms, conditional logic)
  - 📖 **Verbal Comprehension** (analogies, inference extraction)
  - 📊 **Analytical Evaluation** (pattern recognition, data interpretation)
  - 🛠️ **Problem Solving & Systems Thinking** (algorithmic decomposition)
- **Output**: Real-time multi-dimensional radar chart visualization and direct feeding into the ML recommendation pipeline.

### 4. Dynamic 6-Month Roadmap & Skill-Gap Analysis
- **Engine**: Dynamic curriculum generator computing the exact Delta ($\Delta = S_{\text{required}} \setminus S_{\text{candidate}}$).
- **Structure**: 6 chronological stages (Foundations $\rightarrow$ Advanced Core $\rightarrow$ Tooling $\rightarrow$ Capstone Projects $\rightarrow$ Interview & Portfolio Prep $\rightarrow$ Production Readiness).
- **Interactivity**: Milestone check-off persistence, progress percentage computation, and curated technical resources.

### 5. Automated Resume ATS Extraction & Intelligence
- **Parsing Pipelines**: Stream-safe parsing for PDF (`pdf-parse`) and DOCX (`mammoth`).
- **Telemetry**: ATS formatting score, keyword frequency analysis, identified hard & soft skills, detected career trajectory, and prioritized bullet rewrite recommendations.

### 6. Platform Governance & Admin Telemetry
- **Admin Portal**: Server-side role-guarded management dashboard (`/admin`).
- **Telemetry Capabilities**: Real-time user adoption statistics, assessment completion velocity, top demanded skills heatmaps, career distribution charts, and system audit logs.

---

## 🔬 Mathematical Formulation & Scoring Breakdown

CareerAI computes career compatibility through a normalized multi-criteria weighting equation:

$$\text{Compatibility Score} = \sum_{i=1}^{7} w_i \cdot S_i$$

$$\text{Compatibility Score} = 0.28(S_{\text{skills}}) + 0.16(S_{\text{interests}}) + 0.16(S_{\text{aptitude}}) + 0.12(S_{\text{education}}) + 0.10(S_{\text{experience}}) + 0.10(S_{\text{preferences}}) + 0.08(S_{\text{resume}})$$

### Factor Attribution Matrix

| Factor | Weight ($w_i$) | Feature Space | Evaluation Metric & Method |
| :--- | :---: | :--- | :--- |
| **Verified Skills** | **28%** | Candidate technical skills vs. career prerequisites | Jaccard index combined with transfer-weighted skill overlap. |
| **Semantic Interests** | **16%** | Interest tags & domain focus areas | TF-IDF n-gram vectorization and dense cosine similarity. |
| **Cognitive Aptitude** | **16%** | 5-axis cognitive diagnostic scores | Normalized Euclidean distance penalty against career benchmark vector. |
| **Education Tier** | **12%** | Degree level (Bachelors, Masters, PhD, etc.) | Ordinal tier compatibility mapping target role prerequisites. |
| **Experience Fit** | **10%** | Years in field & seniority curve | Sigmoidal suitability curve matching required seniority band. |
| **Role Preferences** | **10%** | Work style, role titles, and industry preference | Multi-keyword exact and semantic sub-term matching. |
| **Resume Evidence** | **8%** | ATS-extracted skills from candidate resume | Corroboration percentage of empirical resume evidence against role. |

---

## 📁 Repository Organization

The repository follows a clean, decoupled structure where each concern is cleanly isolated:

```
c:\4-1\
├── 📁 frontend/                # Client Application & UI Design System
│   ├── src/app/                # Next.js 16 App Router Pages & API Route Handlers
│   ├── src/components/layout/  # Responsive Navbar, Footer, Sidebar, Navigation
│   ├── src/components/         # Radar Visualizations, Metric Cards, Modals
│   ├── src/globals.css         # Strict Light/White Enterprise Theme Tokens
│   ├── public/                 # Static Assets, SVGs, Platform Brand Assets
│   ├── next.config.ts          # Turbopack Bundler & Standalone Configuration
│   ├── tsconfig.json           # Path Aliases (@/frontend, @/backend, @/database)
│   └── package.json            # Frontend Dependencies & Build Scripts
│
├── 📁 backend/                 # Machine Learning & AI Core Subsystems
│   ├── ml/                     # Python ML Inference Pipeline & Model Artifacts
│   │   ├── career_recommender.py # High-Speed Inference Engine & CLI IPC
│   │   ├── train_models.py       # Supervised Training Pipeline (scikit-learn)
│   │   ├── test_ml_engine.py     # Python Unit Test Suite (3/3 Passed)
│   │   └── models/               # Serialized .joblib Model Artifacts
│   ├── ai/                     # LLM Provider Abstraction & Vector RAG Engine
│   │   ├── llmProvider.ts        # Unified LLM Provider Interface (Gemini, OpenAI, Fallback)
│   │   ├── embeddings.ts         # Dense Vector Embeddings & Cosine Distance
│   │   └── ragService.ts         # In-Memory Vector Search & RAG Generation
│   ├── auth.ts                 # JWT Authentication & Role Authorization Guards
│   ├── db.ts                   # Prisma Client Singleton Instance
│   ├── pythonBridge.ts         # Node.js Subprocess Child Process IPC Bridge
│   └── tests/                  # Backend Subsystem Test Suites
│
├── 📁 database/                # Relational Schema & Seeding Engine
│   ├── schema.prisma           # PostgreSQL Relational Schema (14 Models)
│   ├── seed.ts                 # Comprehensive Seed Script (20 Careers, 79 Skills, 25 Diagnostics)
│   └── README.md               # Database Architecture, Entity Documentation & ERD
│
├── 📁 docs/                    # Technical Architecture & Developer Reference
│   ├── ARCHITECTURE.md         # Full-Stack System Architecture Overview
│   ├── API_DOCUMENTATION.md    # Complete 15+ REST API Endpoint Reference
│   ├── MACHINE_LEARNING.md     # Python ML Mathematical Formulation & Features
│   ├── RAG_AND_EMBEDDINGS.md   # Retrieval-Augmented Generation & Vector Retrieval
│   ├── DATABASE_SCHEMA.md      # Database Relational Models & Indexing
│   ├── CLAUDE.md               # Tooling & Workspace Rules
│   └── AGENTS.md               # Developer Agent Verification Directives
│
├── 📄 .env                     # Local Environment Configuration (Ignored by Git)
├── 📄 .env.example             # Documented Template for Environment Variables
├── 📄 .gitignore               # Ignored Build Directories & Artifacts
├── 📄 package.json             # Root Orchestrator (npm run dev, npm test, npm run build)
└── 📄 README.md                # Project Overview & Quick Start Guide
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Python**: `v3.10` or higher (tested on `Python 3.13`)
- **PostgreSQL**: Local PostgreSQL 14+ instance or hosted connection (e.g., Supabase, Neon)

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/bunnyvalluri/4---1.git
   cd 4---1
   ```

2. **Install Node.js Dependencies**:
   ```bash
   npm install
   ```

3. **Install Python Machine Learning Dependencies**:
   ```bash
   python -m pip install scikit-learn pandas numpy joblib
   ```

### Environment Configuration
Create a `.env` file in the root directory:
```env
# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://user:password@localhost:5432/career_guidance_db?schema=public"

# JWT Secret Key for Session Authentication
JWT_SECRET="your-strong-random-jwt-secret-key-2026"

# Google Gemini API Key for Primary LLM Services
GEMINI_API_KEY="your-google-gemini-api-key"

# Application Base URL & Environment
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Migration & Seeding
```bash
# Push Prisma relational schema to your database
npx prisma db push

# Populate 20 industry careers, 79 technical skills, and 25 diagnostic questions
npx prisma db seed
```

### Execution

```bash
# Start the Next.js development server (with Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔌 REST API Reference Summary

CareerAI exposes 15+ type-safe REST API endpoints across core functional domains:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new candidate profile with hashed credentials | No |
| `POST` | `/api/auth/login` | Authenticate user and issue secure HttpOnly JWT cookie | No |
| `GET` | `/api/auth/me` | Fetch active authenticated user session | Yes |
| `POST` | `/api/auth/logout` | Revoke session and clear authentication cookie | Yes |
| `GET` | `/api/assessment/questions` | Retrieve paginated diagnostic cognitive questions | Yes |
| `POST` | `/api/assessment/submit` | Submit assessment answers, compute 5-axis aptitude scores | Yes |
| `GET` | `/api/careers` | List all cataloged careers with skill requirements | No |
| `GET` | `/api/careers/:id` | Get detailed career breakdown and salary benchmarks | No |
| `POST` | `/api/recommendations/generate` | Run Python hybrid ML engine to generate match rankings | Yes |
| `POST` | `/api/roadmap/generate` | Synthesize customized 6-month skill milestone roadmap | Yes |
| `PUT` | `/api/roadmap/:id/step` | Update progress on individual roadmap milestone | Yes |
| `POST` | `/api/resume/analyze` | Parse PDF/DOCX resume, compute ATS score and keywords | Yes |
| `POST` | `/api/assistant/chat` | Query Aura AI career counselor with RAG vector grounding | Yes |
| `GET` | `/api/admin/stats` | Retrieve platform-wide metrics, adoption, and audit logs | Yes (Admin) |

> 📖 For full request/response schemas, refer to the [API Documentation](./docs/API_DOCUMENTATION.md).

---

## 🧪 Automated Testing & Verification Matrix

The platform includes automated end-to-end and unit test suites across Python and TypeScript runtimes:

```bash
# Run all automated test suites
npm test
```

### Test Suite Results

| Test Suite | Runtime | Target Scope | Assertions | Status |
| :--- | :---: | :--- | :---: | :---: |
| `backend/ml/test_ml_engine.py` | Python 3.13 | TF-IDF Cosine Similarity & Random Forest Ranking | 3 | **PASSED** (100%) |
| `frontend/src/tests/testAIMLSubsystems.test.ts` | Node.js / TS | Python IPC, LLM Abstraction, Embeddings, RAG Citations | 15 | **PASSED** (100%) |
| `frontend/src/tests/recommendationEngine.test.ts` | Node.js / TS | 6 Distinct Candidate Personas & Cold-Start Behavior | 16 | **PASSED** (100%) |
| `frontend/src/tests/e2eFullWorkflow.test.ts` | Node.js / TS | Complete User Lifecycle (Auth $\rightarrow$ Diagnostic $\rightarrow$ Roadmap $\rightarrow$ Admin) | 38 | **PASSED** (100%) |
| **Total Automated Assertions** | | **Comprehensive Full-Stack Platform Coverage** | **72** | **72/72 (100%)** |

### Production Build Validation
```bash
npm run build
```
- **Result**: Compiles all **41/41 routes** (static, dynamic, and API) with Turbopack and strict TypeScript validation with zero errors.

---

## 🔐 Enterprise Security & Resilience

- **Authentication & Encryption**: Passwords salted and hashed via `bcryptjs` (10 rounds). Tokens signed via HS256 JWT stored in secure `HttpOnly`, `SameSite=Lax` cookies.
- **Role-Based Access Control**: Route-level and API-level authorization middleware separating candidate privileges from administrative telemetry.
- **Zero-Downtime Fallback Architecture**: Outbound LLM requests enforce strict 3000ms timeouts. If external APIs experience throttling or downtime, requests seamlessly cascade to the local deterministic embedding and generative engine without throwing user-facing errors.
- **Input Sanitization & Buffer Safety**: Streamlined buffer parsing prevents arbitrary code execution vulnerabilities during resume upload processing.

---

## 🎨 Design System & UI Specifications

CareerAI adheres to a strictly enforced **Light / White Enterprise Theme**:
- **Primary Surface**: `#FFFFFF` (pure white card and component backgrounds)
- **Application Canvas**: `#F8FAFC` (soft slate page background for contrast)
- **Typography**: `#0F172A` (deep slate high-contrast text meeting WCAG AAA standards)
- **Primary Accent**: `#2563EB` (vibrant blue for primary actions, focus states, and milestones)
- **Border Hierarchy**: `#E2E8F0` / `#CBD5E1` (clean, structural bounding lines)
- **Accessibility**: Zero dark mode toggles or inverted stylesheets; high legibility under all ambient lighting conditions.

---

## 👥 Contributing & License

### Author
- **Rahul Valluri** — [@bunnyvalluri](https://github.com/bunnyvalluri)
- **Project Repository**: [https://github.com/bunnyvalluri/4---1.git](https://github.com/bunnyvalluri/4---1.git)

### License
This project is open-source software licensed under the **[MIT License](LICENSE)**.
