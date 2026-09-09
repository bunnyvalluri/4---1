'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Target,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { NextBestActionItem } from '@/lib/hooks/useDashboardRealtime';

interface DashboardHeroProps {
  userName?: string;
  branch?: string;
  profileCompletion?: number;
  targetCareer?: string;
  careerMatchScore?: number;
  nextAction?: NextBestActionItem | null;
  relativeTime?: string;
}

export function DashboardHero({
  userName = 'Alex',
  branch = 'Computer Science',
  profileCompletion = 78,
  targetCareer = 'Full Stack Developer',
  careerMatchScore = 92,
  relativeTime = 'just now',
}: DashboardHeroProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userName?.split(' ')[0] || 'Candidate';

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-8 shadow-xs relative overflow-hidden">
      {/* Ambient background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Left Column: Greeting & Target Career Status */}
        <div className="space-y-3 sm:space-y-3.5 max-w-2xl min-w-0">
          {/* Status & Sync Badge Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Career profile synced</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Last updated {relativeTime}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {getGreeting()}, {firstName} 👋
          </h1>

          {/* Target & Profile Stats */}
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
            <p>
              Your career profile is{' '}
              <span className="font-bold text-blue-700">{profileCompletion}% complete</span>.
              You are currently targeting{' '}
              <span className="font-black text-slate-900 tracking-wide uppercase px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 inline-block my-0.5">
                {targetCareer}
              </span>{' '}
              with a <span className="font-black text-emerald-600">{careerMatchScore}% Career Match</span>.
            </p>

            {/* Profile Completion Bar */}
            <div className="w-full max-w-md bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Quick Global Actions (Stacked full-width on mobile, horizontal on desktop) */}
        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 self-stretch sm:self-start lg:self-center w-full sm:w-auto pt-1 sm:pt-0">
          <Link
            href="/recommendations"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all text-center min-h-[44px] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Explore Career Matches</span>
          </Link>
          <Link
            href="/assessment"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300/80 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors text-center min-h-[44px] active:scale-[0.98]"
          >
            <BrainCircuit className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Retake Diagnostic</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
