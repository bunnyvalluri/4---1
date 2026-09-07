# 👥 Authorization & Role-Based Access Control (RBAC)

The platform supports two explicit roles:
1. `USER`: Standard candidate access. Can view and modify their own profile, submit assessments, upload resumes, and view personal recommendations.
2. `ADMIN`: Platform administrator. Can view system telemetry (`/api/v1/admin/metrics`), modify global skills and questions, and update user roles.

Route protection is enforced via FastAPI dependency injection:
```python
async def require_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Administrative privileges required.")
    return current_user
```
