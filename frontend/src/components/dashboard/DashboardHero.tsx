'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
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
  nextAction,
  relativeTime = 'just now',
}: DashboardHeroProps) {
  // Determine time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userName?.split(' ')[0] || 'Engineer';

  const defaultAction: NextBestActionItem = {
    title: 'Complete the System Design assessment',
    reason: `Completing this will improve your ${targetCareer} match score.`,
    action_label: 'Continue Assessment →',
    action_url: '/assessment',
    priority: 'HIGH',
  };

  const action = nextAction || defaultAction;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 lg:p-8 shadow-xs relative overflow-hidden">
      {/* Ambient background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Greeting & Target Career */}
        <div className="space-y-3 max-w-2xl">
          {/* Status & Sync Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Career profile synced</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Last updated {relativeTime}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>

          {/* Target & Profile Stats */}
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5">
            <p>
              Your career profile is{' '}
              <span className="font-bold text-blue-700">{profileCompletion}% complete</span>.
              You are currently targeting{' '}
              <span className="font-black text-slate-900 tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                {targetCareer}
              </span>{' '}
              with a <span className="font-black text-emerald-600">{careerMatchScore}% Career Match</span>.
            </p>

            {/* Profile Completion Bar */}
            <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Quick Global Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 self-start lg:self-center w-full sm:w-auto">
          <Link
            href="/recommendations"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5 text-center min-h-[44px]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore Career Matches</span>
          </Link>
          <Link
            href="/assessment"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300/80 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors text-center min-h-[44px]"
          >
            <BrainCircuit className="h-4 w-4 text-indigo-600" />
            <span>Retake Diagnostic</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* NEXT BEST ACTION BANNER */}
      {/* ======================================================== */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/70">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                Next Best Action
              </span>
              <span className="text-xs font-bold text-slate-900 truncate">
                {action.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              {action.reason}
            </p>
          </div>
        </div>

        <Link
          href={action.action_url}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all shrink-0 self-start md:self-center min-h-[40px]"
        >
          <span>{action.action_label.replace('→', '').trim()}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
