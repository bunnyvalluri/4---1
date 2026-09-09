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
  TrendingUp,
  Check,
} from 'lucide-react';
import { auth, googleProvider, getFirebaseAuth, getGoogleProvider } from '@/lib/firebase/client';
import { signInWithPopup } from 'firebase/auth';
import { BrandLogo } from '@/components/ui/BrandLogo';

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

  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
    setError(null);
  }

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

        const role = String(data.user?.role || '').toUpperCase();
        if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during submission.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  const handleGoogleAuth = async (providedKey?: string) => {
    try {
      setGoogleLoading(true);
      setError(null);

      const firebaseAuth = auth || getFirebaseAuth();
      const provider = googleProvider || getGoogleProvider();

      if (!firebaseAuth || !provider) {
        setGoogleLoading(false);
        setError('Firebase is not configured. Please contact support.');
        return;
      }

      // Replace client references below
      const client = { auth: firebaseAuth, googleProvider: provider };

      const result = await signInWithPopup(client.auth, client.googleProvider!);
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
        throw new Error(data.error || 'Google Sign-In failed on server.');
      }

      setApiKeyModalOpen(false);
      const role = String(data.user?.role || '').toUpperCase();
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push(mode === 'login' ? '/dashboard' : '/onboarding');
      }
      router.refresh();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      console.error('[Firebase Auth Error]', firebaseError.code, firebaseError.message);
      if (firebaseError.code === 'auth/popup-closed-by-user' || firebaseError.code === 'auth/cancelled-popup-request') {
        setGoogleLoading(false);
        return;
      }
      if (firebaseError.code === 'auth/invalid-api-key' || firebaseError.message?.includes('api-key')) {
        setError('Invalid Firebase API Key. Please verify your Web API Key from Firebase Console.');
        setApiKeyModalOpen(true);
      } else if (firebaseError.code === 'auth/internal-error') {
        setError(
          'Firebase internal error: This is usually caused by (1) the current domain not being whitelisted in Firebase Console → Authentication → Settings → Authorized Domains, or (2) a missing/invalid Firebase config. Please add "localhost" (or your deployed domain) to the authorized domains list.'
        );
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setError(firebaseError.message || 'Google Sign-In could not be completed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSaveApiKeyAndSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiKey.trim()) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('NEXT_PUBLIC_FIREBASE_API_KEY', customApiKey.trim());
    }
    handleGoogleAuth(customApiKey.trim());
  };

  return (
    <div className="min-h-screen min-h-screen-dvh w-full bg-white flex flex-col lg:grid lg:grid-cols-12 selection:bg-blue-600 selection:text-white">
      
      {/* ======================================================== */}
      {/* LEFT COLUMN: BRAND STORYTELLING & PRODUCT TELEMETRY PREVIEW */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-slate-50/80 border-r border-slate-200/90 p-8 xl:p-14 flex-col justify-between relative overflow-hidden">
        
        {/* Subtle decorative mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 space-y-8">
          {/* Logo & Platform Tag */}
          <BrandLogo href="/" subtext="Talent Intelligence Suite" size="md" />

          {/* Narrative Headline */}
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>{mode === 'login' ? 'Candidate Command Center' : 'Adaptive Career Guidance'}</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {mode === 'login'
                ? 'Welcome Back to Your Career Command Center.'
                : 'Discover the Career Path That is Right for You.'}
            </h1>

            <p className="text-sm xl:text-base text-slate-600 leading-relaxed font-normal">
              {mode === 'login'
                ? 'Access your explainable career match scores, active 6-month roadmap milestones, and ATS-optimized resume feedback.'
                : 'Join candidates leveraging transparent multi-criteria recommendations, skill gap telemetry, and structured roadmap milestones.'}
            </p>
          </div>

          {/* Realistic Telemetry Preview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src="/hero-student.jpg"
                    alt="Active Candidate"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Candidate Profile</div>
                  <div className="text-[10px] text-slate-400">Engineering Track • Active Guidance</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                92% Match
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Milestone</span>
                <span className="font-semibold text-slate-800">Month 2: Backend APIs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">ATS Resume Score</span>
                <span className="font-semibold text-blue-600">88 / 100 • Strong</span>
              </div>
            </div>

            {/* Skills & Strengths */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Verified Skills:</span>
                <span className="font-semibold text-slate-700">Python, React, SQL, Git</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Priority Gap:</span>
                <span className="font-semibold text-amber-700">System Design (Level 2/5)</span>
              </div>
            </div>
          </div>

          {/* Value Pillars List */}
          <div className="space-y-2.5 max-w-lg text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>Multi-factor utility calculation across skills, education, and aptitude</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>Actionable 6-month curriculum with production project deliverables</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>Profile-grounded AI mentor with live system architecture review</span>
            </div>
          </div>
        </div>

        {/* Left Footer Trust Badges */}
        <div className="relative z-10 pt-8 border-t border-slate-200/80 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-medium text-slate-600">256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="h-4 w-4 text-blue-600" />
            <span className="text-[11px] font-medium text-slate-600">Explainable Scoring</span>
          </div>
          <span>•</span>
          <span className="text-[11px] font-medium text-slate-500">Zero Third-Party Ads</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: AUTHENTICATION FORM */}
      {/* ======================================================== */}
      <div className="col-span-12 lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-4 xs:p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen-dvh">
        
        {/* Top bar with back to home */}
        <div className="flex items-center justify-between mb-6">
          <div className="lg:hidden">
            <BrandLogo href="/" size="xs" />
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors ml-auto flex items-center gap-1 min-h-[36px]"
          >
            <span>← Return to Home</span>
          </Link>
        </div>

        {/* Main Form Center Box */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2.5 min-h-[40px] rounded-lg transition-all text-center cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2.5 min-h-[40px] rounded-lg transition-all text-center cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Context Header */}
          <div className="text-left space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {mode === 'login'
                ? 'Enter your credentials to access your personalized career command center.'
                : 'Start your comprehensive diagnostic and discover your best-fit career.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl p-3 text-xs font-medium bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

            {mode === 'login' && (
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Quick Demo Logins</span>
                  <span className="text-[10px] text-blue-600 font-semibold">1-Click Fill</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@careerai.dev');
                      setPassword('Admin@123456');
                      setError(null);
                    }}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 group-hover:text-indigo-950">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>Admin Portal</span>
                    </div>
                    <span className="text-[10px] text-indigo-600/90 font-mono mt-0.5 truncate w-full">
                      admin@careerai.dev
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alex@example.com');
                      setPassword('Password@123');
                      setError(null);
                    }}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 group-hover:text-blue-950">
                      <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>Candidate</span>
                    </div>
                    <span className="text-[10px] text-blue-600/90 font-mono mt-0.5 truncate w-full">
                      alex@example.com
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full min-h-[44px] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full min-h-[44px] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="password">
                  Password
                </label>
                {mode === 'login' && (
                  <Link
                    href="/forgot-password"
                    prefetch={true}
                    className="text-xs font-semibold text-blue-600 hover:underline min-h-[36px] inline-flex items-center"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[44px] rounded-xl pl-10 pr-11 py-2.5 text-base sm:text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength meter for registration */}
              {mode === 'register' && password && (
                <div className="flex items-center gap-2 pt-1.5">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden flex gap-1 bg-slate-100">
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
                  <span className="text-[10px] font-bold text-slate-500">
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-0.5 min-h-[36px]">
                <label className="flex items-center gap-2 cursor-pointer text-xs select-none text-slate-600">
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
              className="w-full min-h-[44px] rounded-xl py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider bg-white text-slate-400 shrink-0">
              Or continue with
            </span>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleGoogleAuth()}
            disabled={googleLoading || loading}
            className="w-full min-h-[44px] flex items-center justify-center gap-2.5 rounded-xl py-2.5 px-4 text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            <span>{googleLoading ? 'Opening Google Sign-In...' : 'Sign in with Google'}</span>
          </button>

          {/* Terms notice */}
          <p className="text-[11px] text-center text-slate-400 leading-relaxed">
            By continuing, you agree to CareerAI{' '}
            <span className="underline cursor-default">Terms of Service</span> and{' '}
            <span className="underline cursor-default">Privacy Policy</span>.
          </p>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} CareerAI. All rights reserved.
        </div>

      </div>

      {/* Real Google Account Setup Modal */}
      {apiKeyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setApiKeyModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                  <GoogleIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Connect Real Google Accounts
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official OAuth 2.0 via Google & Firebase
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To launch the real Google popup (<span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">accounts.google.com</span>) allowing users to pick their personal Google profile, enter your Firebase Web API Key:
            </p>

            <form onSubmit={handleSaveApiKeyAndSignIn} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Firebase Web API Key (AIzaSy...)
                </label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <span className="block text-[10px] text-slate-500 mt-1">
                  Found in Firebase Console → Project Settings → General → Web App.
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href="https://console.firebase.google.com/project/careerai-app-9777b/settings/general"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Get Key from Console ↗
                </a>
                <button
                  type="submit"
                  disabled={googleLoading || !customApiKey.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {googleLoading ? 'Connecting...' : 'Launch Google Popup →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
