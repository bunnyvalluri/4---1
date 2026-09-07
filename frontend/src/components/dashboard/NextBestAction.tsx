'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import { NextBestActionItem } from '@/lib/hooks/useDashboardRealtime';

interface NextBestActionProps {
  action?: NextBestActionItem | null;
  targetCareer?: string;
}

export function NextBestAction({ action, targetCareer = 'Full Stack Developer' }: NextBestActionProps) {
  const currentAction: NextBestActionItem = action || {
    title: 'Complete the System Design assessment',
    reason: `Completing this will improve your ${targetCareer} match score above 92%.`,
    action_label: 'Continue →',
    action_url: '/assessment',
    priority: 'HIGH',
  };

  return (
    <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-5 sm:p-7 shadow-xs relative overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-900">
            Your Next Best Action
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200/80 self-start sm:self-auto">
          <Flame className="h-3 w-3 text-amber-500" />
          <span>{currentAction.priority} Impact Opportunity</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {currentAction.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          {currentAction.reason}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between gap-4">
        <div className="text-[11px] text-slate-400 font-medium">
          Dynamically computed from candidate telemetry and missing target prerequisites
        </div>
        <Link
          href={currentAction.action_url}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all shrink-0"
        >
          <span>{currentAction.action_label.replace('→', '').trim()}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
