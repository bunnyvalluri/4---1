# 🚀 Firebase Project Setup Guide

## 1. Project Initialization
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project:
   - **Project Name**: `CareerAI Production`
   - **Project ID**: `careerai-production`
3. Enable Google Analytics (recommended for traffic analysis).

---

## 2. Service Activation

### 2.1 Firebase Authentication
1. Navigate to **Authentication** $\to$ **Get Started**.
2. Enable Sign-in Providers:
   - **Email/Password**: Enable.
   - **Google**: Optional (enable and configure OAuth consent screen).
3. Under **Settings** $\to$ **User Actions**, enable *Email verification* and *Account deletion*.

### 2.2 Cloud Firestore
1. Navigate to **Firestore Database** $\to$ **Create database**.
2. Select **Production Mode** (rules start locked).
3. Choose a multi-region or regional location near your primary user base (e.g., `nam5 (us-central)`).

### 2.3 Cloud Storage
1. Navigate to **Storage** $\to$ **Get Started**.
2. Select target location matching Firestore region.
3. Storage bucket name will default to: `careerai-production.appspot.com`.

---

## 3. Service Account Credentials
1. Navigate to **Project Settings** $\to$ **Service accounts** $\to$ **Firebase Admin SDK**.
2. Select **Python** and click **Generate new private key**.
3. Download the JSON file. **DO NOT COMMIT THIS FILE TO GIT.**
4. For local development, place it at `backend/serviceAccountKey.json` (already ignored in `.gitignore`).
5. For production environments, extract the fields into your cloud secrets manager:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
