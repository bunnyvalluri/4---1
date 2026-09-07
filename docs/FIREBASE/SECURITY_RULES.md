# 🛡️ Firebase Security Rules Architecture

## 1. Firestore Security Rules (`firestore.rules`)
Production-grade rules deployed to enforce:
1. **Authenticated Access**: Unauthenticated callers are rejected immediately (`request.auth != null`).
2. **Strict User Ownership**: Users can only read and write documents where `userId == request.auth.uid`.
3. **Role Escalation Protection**: Users cannot modify their own `role` attribute (`request.resource.data.role == resource.data.role`).
4. **Admin Authorization**: Only authenticated tokens with `role == 'ADMIN'` can manage global catalogs and query `audit_logs`.

---

## 2. Storage Security Rules (`storage.rules`)
Enforces:
1. **Directory Isolation**: User A cannot read or write to `/users/{UserB}/`.
2. **File Size Caps**: 10MB for documents, 5MB for images.
3. **MIME Type Whitelisting**: Strict regex matches on `request.resource.contentType`.
