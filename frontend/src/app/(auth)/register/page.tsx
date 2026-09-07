'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/onboarding');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
        throw new Error(data.error || 'Google sign-up failed');
      }

      router.push('/onboarding');
      router.refresh();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in provider is not yet enabled in Firebase Console. Please enable it in Authentication -> Sign-in method.');
        return;
      }
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setGoogleLoading(false);
    }
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your CareerAI account</h1>
          <p className="text-xs text-slate-500">
            Start your personalized skill roadmap and career matching journey
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

          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-slate-400 hover:-translate-y-0.5 focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or sign up with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

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
                  placeholder="jane@example.com"
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 focus:outline-none disabled:opacity-50 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Continue to Onboarding'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
