# 💻 Local Development with Firebase Emulator Suite

## 1. Installing Firebase CLI & Emulators
Ensure Java (JRE 11+) and Node.js are installed:
```bash
npm install -g firebase-tools
```

---

## 2. Starting Emulators
Run from project root:
```bash
firebase emulators:start
```
- **Emulator UI**: [http://localhost:4000](http://localhost:4000)
- **Auth**: `localhost:9099`
- **Firestore**: `localhost:8080`
- **Storage**: `localhost:9199`

---

## 3. Configuring FastAPI Backend for Emulators
In `backend/.env`:
```env
USE_FIREBASE_EMULATOR=true
FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
FIREBASE_STORAGE_EMULATOR_HOST="127.0.0.1:9199"
```
The Firebase Admin SDK automatically redirects all network calls to the local emulator endpoints. Production credentials are not required.
