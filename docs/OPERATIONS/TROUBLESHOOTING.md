# 🔍 Troubleshooting Runbook

| Symptom | Probable Cause | Remediation |
| :--- | :--- | :--- |
| `500 Internal Server Error` on resume upload | Corrupted PDF stream or PyMuPDF failure | Verify PDF magic bytes; inspect server logs for fitz stacktrace |
| `401 Unauthorized` on all requests | Expired JWT or mismatched `SECRET_KEY` | Re-authenticate via `/api/v1/auth/login`; verify server `.env` |
| Recommendations latency $> 1\text{s}$ | High connection count or unindexed query | Verify database index on `user_skills(user_id)` |
