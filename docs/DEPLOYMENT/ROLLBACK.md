# ⏪ Rollback Strategy

1. **Application Rollback**: Re-deploy previous container image tag.
2. **Database Rollback**: Run `alembic downgrade -1` if a migration caused regressions.
3. **Post-Rollback Verification**: Verify `/api/v1/health` status returns `200 OK`.
