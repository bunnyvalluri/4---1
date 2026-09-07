import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

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
let googleProvider: GoogleAuthProvider | null = null;

export function initFirebaseAuth(customApiKey?: string): { auth: Auth | null; googleProvider: GoogleAuthProvider | null } {
  if (typeof window === 'undefined') return { auth: null, googleProvider: null };

  const apiKey = customApiKey || getStoredApiKey();
  if (!apiKey || apiKey.includes('XXXXX')) {
    return { auth: null, googleProvider: null };
  }

  try {
    const config = {
      ...getFirebaseConfig(),
      apiKey,
    };
    app = !getApps().length ? initializeApp(config) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    return { auth, googleProvider };
  } catch (error) {
    console.warn('Failed to initialize Firebase client:', error);
    return { auth: null, googleProvider: null };
  }
}

// Auto-initialize if key is available
if (typeof window !== 'undefined') {
  initFirebaseAuth();
}

export { auth, googleProvider };
