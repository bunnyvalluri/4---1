'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Mail, ArrowRight, CheckCircle2, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#0B0F19] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Ambient Lighting FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center space-y-6">
        {/* Brand Header */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all">
            <Compass className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-white">
              Career<span className="text-blue-500">AI</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Account Recovery
            </span>
          </div>
        </Link>

        <div className="w-full rounded-3xl border border-white/[0.08] bg-[#121829]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-white">Verification Link Dispatched</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <strong className="text-white font-mono">{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-left">
                <h1 className="text-lg font-bold text-white tracking-tight">Reset your password</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your verified account email address to receive password recovery instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300" htmlFor="email">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:bg-white/[0.06] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Encrypted Account Recovery</span>
        </div>
      </div>
    </div>
  );
}
