import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      localStorage.getItem('NEXT_PUBLIC_FIREBASE_API_KEY') ||
      ''
    );
  }
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
}

function getStoredAppId(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
      localStorage.getItem('NEXT_PUBLIC_FIREBASE_APP_ID') ||
      ''
    );
  }
  return process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '';
}

export function getFirebaseConfig() {
  const apiKey = getStoredApiKey();
  const appId = getStoredAppId();
  return {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'careerai-app-9777b.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'careerai-app-9777b',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'careerai-app-9777b.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (app) return app;

  const apiKey = getStoredApiKey();
  if (!apiKey || apiKey.includes('XXXXX')) return null;

  try {
    const config = {
      ...getFirebaseConfig(),
      apiKey,
    };
    app = !getApps().length ? initializeApp(config) : getApp();
    return app;
  } catch (err) {
    console.warn('Failed to initialize Firebase App:', err);
    return null;
  }
}

export function initFirebaseAuth(customApiKey?: string): { auth: Auth | null; googleProvider: GoogleAuthProvider | null } {
  if (typeof window === 'undefined') return { auth: null, googleProvider: null };

  const fbApp = getFirebaseApp();
  if (!fbApp) return { auth: null, googleProvider: null };

  try {
    auth = getAuth(fbApp);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    return { auth, googleProvider };
  } catch (error) {
    console.warn('Failed to initialize Firebase Auth client:', error);
    return { auth: null, googleProvider: null };
  }
}

export function getFirebaseFirestore(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (db) return db;

  const fbApp = getFirebaseApp();
  if (!fbApp) return null;

  try {
    db = getFirestore(fbApp);
    return db;
  } catch (err) {
    console.warn('Failed to initialize Firestore client:', err);
    return null;
  }
}

// Auto-initialize if running client-side
if (typeof window !== 'undefined') {
  initFirebaseAuth();
  getFirebaseFirestore();
}

export { auth, db, googleProvider };
