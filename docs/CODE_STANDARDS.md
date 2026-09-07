# 📏 Coding Standards & Best Practices

## 1. Python Backend Standards
- **Python Version**: Python 3.12+ features (modern union syntax `X | Y`, type annotations).
- **Style Guide**: PEP 8 compliance enforced by Ruff.
- **Typing**: Strict type hinting on all function arguments and returns:
  ```python
  async def get_career_by_slug(slug: str, db: AsyncSession) -> Career | None:
      ...
  ```
- **Async Safety**: Never call blocking I/O inside async route handlers. Use async libraries (`asyncpg`, `aiofiles`) or `asyncio.to_thread`.
- **FastAPI Dependency Injection**: Use `Depends(get_db)` for database sessions and `Depends(get_current_user)` for authentication.

---

## 2. TypeScript / React Frontend Standards
- **TypeScript**: Strict mode enabled (`noImplicitAny: true`).
- **Component Architecture**: Keep server components where possible; use `"use client"` only for interactive state (forms, modals, charts).
- **Styling**: Tailwind utility classes only. Avoid inline styles or custom ad-hoc CSS.
