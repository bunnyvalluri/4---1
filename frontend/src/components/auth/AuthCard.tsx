'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase/client';
import { signInWithPopup } from 'firebase/auth';

function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18">
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

interface AuthCardProps {
  initialMode: 'login' | 'register';
}

export function AuthCard({ initialMode }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/onboarding');
    router.prefetch('/login');
    router.prefetch('/register');
  }, [router]);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '#CBD5E1' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: 'Fair', color: '#F59E0B' };
    if (score <= 4) return { score: 2, label: 'Good', color: '#2563EB' };
    return { score: 3, label: 'Strong', color: '#10B981' };
  }, [password]);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    window.history.replaceState(null, '', newMode === 'login' ? '/login' : '/register');
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid email or password.');
        }

        router.push('/dashboard');
        router.refresh();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed.');
        }

        router.push('/onboarding');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      setError(null);

      if (auth && googleProvider) {
        try {
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
          if (res.ok) {
            router.push(mode === 'login' ? '/dashboard' : '/onboarding');
            router.refresh();
            return;
          }
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/popup-closed-by-user') {
            setGoogleLoading(false);
            return;
          }
        }
      }

      const targetEmail = email?.trim() || 'alex@example.com';
      const targetName = targetEmail === 'alex@example.com' ? 'Alex Johnson' : (name?.trim() || targetEmail.split('@')[0]);
      const targetPhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          photoURL: targetPhoto,
          uid: 'google-' + targetEmail.replace(/[^a-zA-Z0-9]/g, '-'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google Sign-In failed');
      }

      router.push(mode === 'login' ? '/dashboard' : '/onboarding');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative selection:bg-blue-600 selection:text-white"
      style={{
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Decorative ambient gradients */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 pointer-events-none blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(37,99,235,0.15), rgba(99,102,241,0.08), transparent 70%)',
        }}
      />

      {/* Main Centered Container with Strict Max-Width */}
      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: '440px' }}>
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                boxShadow: '0 8px 16px -4px rgba(37,99,235,0.3)',
              }}
            >
              <Compass className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight" style={{ color: '#0F172A' }}>
                Career<span style={{ color: '#2563EB' }}>AI</span>
              </span>
              <span className="block text-[10px] font-bold tracking-wider uppercase" style={{ color: '#64748B' }}>
                Talent Intelligence Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Master Auth Card */}
        <div
          className="w-full rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(15,23,42,0.06), 0 8px 10px -6px rgba(15,23,42,0.03)',
          }}
        >
          {/* Segmented Mode Switcher */}
          <div
            className="grid grid-cols-2 p-1 rounded-xl mb-5"
            style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center"
              style={{
                backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#0F172A' : '#64748B',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className="py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center"
              style={{
                backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#0F172A' : '#64748B',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Context Header */}
          <div className="mb-5 text-left">
            <h1 className="text-lg font-bold tracking-tight" style={{ color: '#0F172A' }}>
              {mode === 'login' ? 'Welcome back to CareerAI' : 'Create candidate account'}
            </h1>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>
              {mode === 'login'
                ? 'Sign in to access your skills dashboard and recommendations.'
                : 'Free sandbox account with personalized AI career telemetry.'}
            </p>
          </div>

          {/* Quick 1-Click Sandbox Fast Access (Sign In Mode) */}
          {mode === 'login' && (
            <div
              className="p-3 rounded-xl mb-5"
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: '#475569' }}
                >
                  <Zap className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} />
                  1-Click Instant Sandbox Logins
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                >
                  Ready
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alex@example.com', 'Password@123')}
                  disabled={loading}
                  className="flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer group"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                  }}
                >
                  <div className="overflow-hidden pr-1">
                    <div className="text-xs font-bold truncate group-hover:text-blue-600" style={{ color: '#0F172A' }}>
                      Alex Johnson
                    </div>
                    <div className="text-[10px] truncate" style={{ color: '#64748B' }}>Candidate</div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                  >
                    Enter
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@careerai.dev', 'Admin@123456')}
                  disabled={loading}
                  className="flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer group"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                  }}
                >
                  <div className="overflow-hidden pr-1">
                    <div className="text-xs font-bold truncate group-hover:text-indigo-600 flex items-center gap-1" style={{ color: '#0F172A' }}>
                      <Shield className="h-3 w-3" style={{ color: '#4F46E5' }} /> Admin
                    </div>
                    <div className="text-[10px] truncate" style={{ color: '#64748B' }}>System Portal</div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
                  >
                    Enter
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-xl p-3 text-xs font-medium mb-4"
              style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }} htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: '#94A3B8' }} />
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }} htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: '#94A3B8' }} />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold" style={{ color: '#334155' }} htmlFor="password">
                  Password
                </label>
                {mode === 'login' && (
                  <Link
                    href="/forgot-password"
                    prefetch={true}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: '#2563EB' }}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: '#94A3B8' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl pl-10 pr-11 py-2.5 text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength meter for registration */}
              {mode === 'register' && password && (
                <div className="flex items-center gap-2 pt-1.5">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden flex gap-1" style={{ backgroundColor: '#F1F5F9' }}>
                    <div
                      className="h-full flex-1 rounded-full transition-all"
                      style={{ backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : '#E2E8F0' }}
                    />
                    <div
                      className="h-full flex-1 rounded-full transition-all"
                      style={{ backgroundColor: passwordStrength.score >= 2 ? passwordStrength.color : '#E2E8F0' }}
                    />
                    <div
                      className="h-full flex-1 rounded-full transition-all"
                      style={{ backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : '#E2E8F0' }}
                    />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: '#64748B' }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs select-none" style={{ color: '#475569' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded cursor-pointer accent-blue-600"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Continue'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full" style={{ borderTop: '1px solid #E2E8F0' }} />
            <span
              className="px-3 text-[10px] font-extrabold uppercase tracking-wider shrink-0"
              style={{ backgroundColor: '#FFFFFF', color: '#94A3B8' }}
            >
              Or continue with
            </span>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 px-4 text-xs font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
            }}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="w-full flex items-center justify-center gap-4 text-xs py-3 mt-1" style={{ color: '#64748B' }}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
            <span className="text-[11px] font-medium">256-Bit Encrypted</span>
          </div>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="h-3.5 w-3.5" style={{ color: '#2563EB' }} />
            <span className="text-[11px] font-medium">Explainable AI</span>
          </div>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#4F46E5' }} />
            <span className="text-[11px] font-medium">Python ML Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
