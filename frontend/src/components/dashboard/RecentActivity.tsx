'use client';

import React from 'react';
import {
  CheckCircle2,
  FileCheck,
  Map,
  Award,
  Sparkles,
  History,
} from 'lucide-react';
import { ActivityItem } from '@/lib/hooks/useDashboardRealtime';

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const items = activities;

  const renderIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'ASSESSMENT':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'RESUME':
        return <FileCheck className="h-4 w-4 text-violet-600" />;
      case 'ROADMAP':
        return <Map className="h-4 w-4 text-indigo-600" />;
      case 'SKILLS':
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500 shrink-0" />
          <span>Recent Activity</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-400">Live Telemetry Feed</span>
      </div>

      {items.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {items.map((act) => (
            <div
              key={act.id}
              className="py-3 sm:py-3.5 flex items-start sm:items-center justify-between gap-3 first:pt-0 last:pb-0 min-w-0"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs mt-0.5 sm:mt-0">
                  {renderIcon(act.category)}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 break-words line-clamp-2">
                    {act.title}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium sm:hidden block">
                    {act.relative_time}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-medium shrink-0 hidden sm:block">
                {act.relative_time}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mx-auto border border-slate-200">
            <History className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">No Recent Activity Recorded</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Diagnostic attempts, resume audits, and milestone completions will be logged here in real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
