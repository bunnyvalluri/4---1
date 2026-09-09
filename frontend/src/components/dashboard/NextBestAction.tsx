'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Flame } from 'lucide-react';
import { NextBestActionItem } from '@/lib/hooks/useDashboardRealtime';

interface NextBestActionProps {
  action?: NextBestActionItem | null;
  targetCareer?: string;
}

export function NextBestAction({ action, targetCareer = 'Full Stack Developer' }: NextBestActionProps) {
  const currentAction: NextBestActionItem = action || {
    title: 'Complete the System Design assessment',
    reason: `Completing this will improve your ${targetCareer} match score above 92%.`,
    action_label: 'Continue Assessment →',
    action_url: '/assessment',
    priority: 'HIGH',
  };

  return (
    <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-4 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden space-y-3.5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-900">
            Next Best Action
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200/80 self-start sm:self-auto">
          <Flame className="h-3 w-3 text-amber-500 shrink-0" />
          <span>{currentAction.priority} Impact Opportunity</span>
        </div>
      </div>

      {/* Action Title & Reason */}
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-snug">
          {currentAction.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          {currentAction.reason}
        </p>
      </div>

      {/* Footer / Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-blue-100/60">
        <div className="text-[11px] text-slate-500 font-medium">
          Dynamically computed from candidate telemetry and missing target prerequisites
        </div>
        <Link
          href={currentAction.action_url}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all min-h-[44px] w-full sm:w-auto text-center shrink-0 active:scale-[0.98]"
        >
          <span>{currentAction.action_label}</span>
        </Link>
      </div>
    </div>
  );
}
