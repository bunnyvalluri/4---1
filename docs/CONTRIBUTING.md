# 🤝 Contributing Guidelines

We welcome contributions to CareerAI! Please follow these standards to ensure code quality and consistency.

## 1. Branching Strategy
- `main`: Production-ready releases.
- `develop`: Integration branch for tested feature code.
- Feature branches: `feat/<feature-name>` (e.g., `feat/resume-ats-audit`).
- Bugfix branches: `fix/<issue-name>` (e.g., `fix/jwt-expiration-handling`).

---

## 2. Pull Request (PR) Checklist
1. All 11 pytest backend unit and integration tests must pass.
2. Code must follow [Code Standards](./CODE_STANDARDS.md) (formatting & types).
3. New API endpoints must include Pydantic request and response schemas.
4. Update relevant documentation in `docs/` if modifying database models or endpoints.
