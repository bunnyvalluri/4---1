'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

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
}: MetricCardProps) {
  const badgeColor = {
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    violet: 'bg-violet-100 text-violet-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  }[badgeVariant];

  const content = (
    <div className="flex flex-col gap-2 h-full">
      {/* Header: icon + badge */}
      <div className="flex items-center justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg} ${iconColor} shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
        {value}
      </div>

      {/* Label */}
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-tight">
        {label}
      </div>

      {/* Subtext */}
      <div className="text-[11px] text-slate-400 leading-tight flex-1">
        {subtext}
      </div>

      {/* Progress */}
      {progressPercent !== undefined && (
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-auto">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );

  const wrapper = "block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group min-w-[160px] flex-1";

  return actionHref ? (
    <Link href={actionHref} className={wrapper}>
      {content}
    </Link>
  ) : (
    <div className={wrapper}>
      {content}
    </div>
  );
}
