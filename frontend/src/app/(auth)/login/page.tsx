'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, ArrowRight, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase/client';
import { signInWithPopup } from 'firebase/auth';

function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);

      if (!auth) {
        throw new Error('Firebase client is not initialized in browser environment.');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in provider is not yet enabled in Firebase Console. Please enable it in Authentication -> Sign-in method.');
        return;
      }
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh-subtle">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Career<span className="text-blue-600">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to your account</h1>
          <p className="text-xs text-slate-500">
            Access your career matches, skill gaps, and learning roadmaps
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-slate-400 hover:-translate-y-0.5 focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or continue with email
            </span>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 focus:outline-none disabled:opacity-50 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-center">
              One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('alex@example.com', 'Password@123')}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 p-2.5 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900">Candidate Demo</div>
                <div className="text-[10px] text-slate-500">Alex Johnson</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@careerai.dev', 'Admin@123456')}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 p-2.5 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-indigo-700 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Admin Portal
                </div>
                <div className="text-[10px] text-slate-500">System Admin</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs font-semibold text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
