# 🔄 Integration Testing

Integration tests verify repository and service layers against an async database instance using `aiosqlite` fixtures.

## 1. Test Fixtures (`conftest.py`)
- Provides an isolated `AsyncSession` per test.
- Automatically creates all tables before test execution and drops them on teardown.
- Seeds test admin and candidate users with known tokens.
