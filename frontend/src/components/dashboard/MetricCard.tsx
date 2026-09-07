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

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between min-w-0 group">
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">
            {label}
          </span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg} ${iconColor} shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* Primary Metric Number & Badge */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {value}
          </div>
          {badge && (
            <span
              className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badgeClasses}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Supporting Information Subtext */}
        <div className="text-xs text-slate-600 font-medium truncate">
          {subtext}
        </div>

        {/* Visual Progress Bar */}
        {progressPercent !== undefined && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}
      </div>

      {/* Action Footer Link */}
      {actionHref && (
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Link
            href={actionHref}
            className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group-hover:underline"
          >
            <span>{actionText || 'View Details'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
