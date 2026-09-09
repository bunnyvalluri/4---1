'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  badge?: string;
  badgeVariant?: 'blue' | 'emerald' | 'indigo' | 'violet' | 'amber' | 'slate';
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  progressPercent?: number;
  progressColor?: string;
  actionHref?: string;
  actionText?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  badge,
  badgeVariant = 'blue',
  icon: Icon,
  iconBg,
  iconColor,
  progressPercent,
  progressColor = 'bg-blue-600',
  actionHref,
  actionText,
}: MetricCardProps) {
  const badgeClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    violet: 'bg-violet-50 text-violet-700 border-violet-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeVariant];

  const card = (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col gap-2.5 min-w-0 group h-full">
      {/* Icon + Label row */}
      <div className="flex items-start justify-between gap-1.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg} ${iconColor} shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-right leading-tight line-clamp-2 flex-1">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
        {value}
      </div>

      {/* Badge */}
      {badge && (
        <span className={`self-start text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badgeClasses} truncate max-w-full`}>
          {badge}
        </span>
      )}

      {/* Subtext */}
      <div className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2 flex-1">
        {subtext}
      </div>

      {/* Progress bar */}
      {progressPercent !== undefined && (
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}

      {/* Action link */}
      {actionHref && (
        <div className="pt-1 border-t border-slate-100 mt-auto">
          <span className="font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-0.5 text-[11px] group-hover:underline">
            <span className="truncate">{actionText || 'View'}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
          </span>
        </div>
      )}
    </div>
  );

  return actionHref ? (
    <Link href={actionHref} className="block h-full">
      {card}
    </Link>
  ) : (
    card
  );
}
