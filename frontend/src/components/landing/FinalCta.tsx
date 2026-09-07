'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Compass, Check } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-blue-200/90 bg-gradient-to-b from-blue-50/50 via-slate-50/30 to-white p-8 sm:p-16 lg:p-20 text-center shadow-xl shadow-blue-500/5 overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-200 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Start Your Trajectory Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your Career Starts With the Right Direction.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Discover your strengths, understand your skill gaps, and build a personalized path toward your career goals.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-[0.99]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/recommendations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-7 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all active:scale-[0.99]"
              >
                <span>Explore Career Paths</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                Free comprehensive diagnostic
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                Instant personalized recommendations
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
