# 🔍 Firebase Troubleshooting Guide

| Issue | Probable Cause | Remediation |
| :--- | :--- | :--- |
| `Firebase ID token has expired` | Client clock drift or expired token | Refresh token using `currentUser.getIdToken(true)` on client before request. |
| `Missing or insufficient permissions` in Firestore | Security rule mismatch | Check `request.auth.uid` against document `userId` field; verify custom role claim. |
| `Bucket does not exist` error in Storage | Bucket name mismatch in settings | Ensure `FIREBASE_STORAGE_BUCKET` matches project console bucket identifier. |
| `Service account private key error` | Escaped newlines in `.env` | Ensure `\n` in `FIREBASE_PRIVATE_KEY` is converted to actual newlines via `.replace('\n', '
')`. |
