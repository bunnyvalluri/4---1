# 🔑 Authentication Architecture

## 1. Password Hashing (Bcrypt)
All user passwords are encrypted using `passlib[bcrypt]` with an adaptive work factor (12 rounds):
- Passwords are never stored in plaintext.
- Salt is generated cryptographically per password.

---

## 2. JWT Bearer Tokens
- Signed with `HS256` using the platform's `SECRET_KEY`.
- Token payload contains:
  ```json
  {
    "sub": "user_id_string",
    "role": "USER",
    "exp": 1772450000
  }
  ```
- Expiration is enforced strictly via FastAPI's `HTTPBearer` dependency.
