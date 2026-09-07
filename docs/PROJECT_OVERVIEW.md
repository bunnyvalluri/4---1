# 🎯 Project Overview: CareerAI

## 1. Executive Summary
**CareerAI** is an intelligent career guidance and skill development platform designed to bridge the gap between candidate qualifications and market demand. By unifying multi-factor machine learning, psychometric cognitive diagnostics, automated ATS resume parsing, and personalized 6-month curriculum synthesis, CareerAI transforms career navigation from intuition-based guesswork into a transparent, quantifiable, and data-driven discipline.

---

## 2. Core Value Proposition
Traditional career counseling platforms suffer from static keyword lookups, opaque recommendation models, and generic advice. CareerAI solves these limitations through:
1. **Explainable Multi-Factor Scoring**: Career compatibility is scored through an inspectable 4-dimensional model (Technical Skills 40%, Cognitive Aptitude 25%, Semantic Interest 20%, Experience Curve 15%).
2. **Deep Document Intelligence**: Resumes are parsed into structured abstract syntax via **PyMuPDF (`fitz`)** and audited against Google's XYZ impact formula (*Accomplished [X] as measured by [Y] by doing [Z]*).
3. **Adaptive 6-Month Roadmaps**: Dynamic month-by-month curricula populated with concrete milestones, skill-acquisition tasks, and portfolio project suggestions tailored to individual gaps.
4. **Context-Aware AI Consultation**: Low-latency, streaming conversational advisor (FastAPI SSE + Google Gemini 1.5 Flash) with full access to user diagnostic metrics.

---

## 3. Platform Architecture Pillars
- **Strict Separation of Concerns**: Next.js 15 handles rendering, client state, and responsive visual design. The Python FastAPI ASGI server handles all computation, machine learning, resume parsing, database persistence, and AI orchestration.
- **Enterprise-Grade Asynchronous Persistence**: SQLAlchemy 2.0 Async Sessionmaker paired with PostgreSQL (`asyncpg`) and SQLite local support.
- **Zero Opaque Heuristics**: Every skill gap, recommendation score, and roadmap milestone provides mathematical transparency.
