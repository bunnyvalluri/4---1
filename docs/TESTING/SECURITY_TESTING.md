# 🛡️ Security Regression Testing

Automated verification of security boundaries:
1. **RBAC Guard**: Ensures standard users receive `403 Forbidden` on `/api/v1/admin/metrics`.
2. **SQL Injection**: Validates parameterized queries withstand injection strings (`' OR 1=1 --`).
3. **Payload Spoofing**: Verifies Pydantic rejects extra unexpected fields when strict mode is active.
