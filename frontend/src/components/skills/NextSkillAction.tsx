'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { NextBestSkillAction } from '@/lib/hooks/useSkillIntelligence';

interface NextSkillActionProps {
  action?: NextBestSkillAction;
}

export function NextSkillActionCard({ action }: NextSkillActionProps) {
  if (!action) return null;

  return (
    <div className="rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-6 sm:p-7 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-xs font-bold text-indigo-800 border border-indigo-200">
            <Zap className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />
            <span>YOUR NEXT BEST SKILL ACTION</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {action.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800">Why: </span>
            {action.reason}
          </p>

          {/* Progress bar */}
          <div className="pt-2 max-w-md">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-500">Progress</span>
              <span className="text-indigo-700">{action.progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${action.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action CTA */}
        <div className="shrink-0">
          <Link
            href={action.action_url || '/roadmap'}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 group"
          >
            <span>{action.action_label || 'Continue Learning'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
