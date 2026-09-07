# 🔄 Continuous Integration & Deployment (CI/CD)

Configured via `.github/workflows/ci.yml`:
1. **Linting**: Runs Ruff for Python backend and ESLint for Next.js frontend.
2. **Automated Testing**: Executes pytest suite (`python -m pytest backend/tests`).
3. **Container Build**: Builds Docker image and tags with commit SHA.
4. **Deploy**: Triggers webhook or deploys container to production cluster.
