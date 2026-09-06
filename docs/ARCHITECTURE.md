# CareerAI Platform Architecture

## High-Level System Architecture

CareerAI is structured into dedicated, decoupled subsystems:

```
├── 📁 frontend/     # Client UI, Design System, Layouts & Themes
├── 📁 backend/      # Server, ML Models, AI Engine, Authentication & APIs
├── 📁 database/     # PostgreSQL Schema, Relational Models & Seeding
├── 📁 docs/         # Architecture, API Specifications, ML & Setup Guides
└── 📁 public/       # Static Visual Assets & SVG Icons
```

---

## 1. Frontend Layer (`frontend/`)
- **Framework**: React 19 / Next.js App Router
- **Theme**: Strict **Light / White Theme Only** (`#FFFFFF` cards, `#F8FAFC` page background, `#0F172A` text, `#2563EB` accent).
- **Core Components**:
  - `Navbar`: Responsive navigation with mobile menu drawer.
  - `Footer`: 4-column structured footer with system links.
  - `Sidebar`: Collapsible navigation for candidate portal.
  - Interactive radar charts and visual skill gap meters using `recharts`.

---

## 2. Backend Layer (`backend/`)
- **Machine Learning Subsystem** (`backend/ml/`):
  - Built with **Python 3.13**, **scikit-learn**, **pandas**, and **numpy**.
  - Dual model: TF-IDF dense cosine vector matching + supervised Random Forest suitability classifier.
  - Explainable multi-factor attribution decomposition.
  - Subprocess IPC bridge (`backend/pythonBridge.ts`) connecting Node.js runtime with Python ML inference.
- **AI & RAG Subsystem** (`backend/ai/`):
  - **LLM Abstraction Layer**: Unified `ILLMProvider` supporting Google Gemini, OpenAI, and Deterministic fallback.
  - **Embeddings**: Dense semantic vector generation and cosine distance calculations.
  - **Retrieval-Augmented Generation (RAG)**: Indexes career taxonomies and playbooks, retrieving top-$k$ contextual chunks to ground AI responses with citations.
- **Authentication**: Salted `bcryptjs` password hashing and JWT (HS256) session validation.

---

## 3. Database Layer (`database/`)
- **ORM**: Prisma Client (`@prisma/client`)
- **Database Engine**: PostgreSQL
- **Schema Location**: `database/schema.prisma`
- **Seed Script**: `database/seed.ts` (20 Careers, 79 Skills, 25 Cognitive Questions)

---

## 4. Documentation Layer (`docs/`)
- Contains all technical specifications, setup instructions, ML mathematical formulation, and API references.
