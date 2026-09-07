# 🔑 Authentication API Reference

Handles account creation, credential verification, and JWT session token generation.

## 1. Register Candidate
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer"
  }
  ```

---

## 2. User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer"
  }
  ```

---

## 3. Get Current User Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Response** (`200 OK`):
  ```json
  {
    "id": "cuid_user_123",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "role": "USER",
    "avatar": null,
    "createdAt": "2026-03-01T10:00:00Z"
  }
  ```
