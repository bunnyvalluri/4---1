# 🌐 API Endpoint Testing

Tests use `httpx.AsyncClient` with `ASGITransport(app=app)` to test live HTTP endpoints:

```bash
python -m pytest backend/tests/test_auth.py backend/tests/test_careers.py -v
```

### Coverage Matrix:
- Registration with existing email $\to$ returns `400`.
- Login with invalid password $\to$ returns `401`.
- Protected endpoints without token $\to$ returns `401`.
