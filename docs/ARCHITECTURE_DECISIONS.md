# ⚖️ Architecture Decision Records (ADRs)

## ADR 001: 100% Python ASGI Backend with FastAPI
- **Status**: Accepted
- **Context**: The platform requires heavy machine learning scoring, TF-IDF vector algebra, PyMuPDF binary parsing, and asynchronous LLM streaming. Managing ML in Python while hosting API routes in Node.js introduced brittle IPC subprocess bridges and latency.
- **Decision**: Consolidate 100% of backend services into Python 3.12+ FastAPI.
- **Consequences**: Single language runtime for data science and API endpoints, shared Pydantic validation models, high concurrency with native `asyncio`.

---

## ADR 002: SQLAlchemy 2.0 Async with `asyncpg`
- **Status**: Accepted
- **Context**: High-concurrency recommendation requests require non-blocking database queries without thread pool exhaustion.
- **Decision**: Adopt SQLAlchemy 2.0 declarative models with `create_async_engine` and `asyncpg` driver for PostgreSQL, with fallback to `aiosqlite`.
- **Consequences**: Type-safe async queries, zero blocking I/O, native JSON column support for flexible curricula storage.

---

## ADR 003: Server-Sent Events (SSE) for AI Assistant Streaming
- **Status**: Accepted
- **Context**: Candidates require real-time interactive feedback when consulting the AI advisor. WebSockets require stateful connection negotiation and complex ingress handling.
- **Decision**: Implement unidirectional HTTP streaming using Server-Sent Events (`text/event-stream`).
- **Consequences**: Works over standard HTTP/2, auto-reconnection out of the box, simple frontend consumption with `EventSource` / `fetch` readable streams.

---

## ADR 004: PyMuPDF (`fitz`) for Resume Parsing
- **Status**: Accepted
- **Context**: Parsing PDF resumes requires extracting text positioning, layout flow, and font metadata without heavyweight OCR dependencies.
- **Decision**: Utilize `PyMuPDF` (C-bindings to MuPDF) for ultra-fast (sub-20ms) text extraction.
- **Consequences**: Extreme performance, minimal memory footprint, accurate tabular text extraction.
