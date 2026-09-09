'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { CareerMatchBreakdown } from '@/lib/hooks/useDashboardRealtime';

interface CareerMatchCardProps {
  careerTitle?: string;
  matchScore?: number;
  breakdown?: CareerMatchBreakdown;
  whyFits?: string[];
}

export function CareerMatchCard({
  careerTitle = 'Target Career Not Selected',
  matchScore = 0,
  breakdown = {
    skills: 0,
    interests: 0,
    aptitude: 0,
    education: 0,
    experience: 0,
    preference: 0,
  },
  whyFits = [],
}: CareerMatchCardProps) {
  const hasSelectedCareer = matchScore > 0 && careerTitle !== 'Target Career Not Selected';
  const factors = [
    { label: 'Skills', value: breakdown?.skills ?? 0, color: '#2563EB' },
    { label: 'Interests', value: breakdown?.interests ?? 0, color: '#10B981' },
    { label: 'Aptitude', value: breakdown?.aptitude ?? 0, color: '#4F46E5' },
    { label: 'Education', value: breakdown?.education ?? 0, color: '#F59E0B' },
    { label: 'Experience', value: breakdown?.experience ?? 0, color: '#8B5CF6' },
    { label: 'Career Preference', value: breakdown?.preference ?? 0, color: '#06B6D4' },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 min-w-0 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[10px] font-black uppercase tracking-wider text-blue-700 border border-blue-200/70">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>Top Career Match</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words">
            {careerTitle}
          </h2>
          <p className="text-xs text-slate-500">
            Algorithmic multi-factor compatibility evaluation
          </p>
        </div>

        {/* Compatibility Callout Box */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-blue-50/80 border border-blue-200/90 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="text-3xl font-black text-blue-700 leading-none">{matchScore}%</div>
          <div className="text-left leading-tight">
            <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">
              Compatibility
            </div>
            <div className="text-xs font-bold text-slate-700">Verified Fit</div>
          </div>
        </div>
      </div>

      {/* Multi-Factor Compatibility Breakdown Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Dimensional Compatibility Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {factors.map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">{f.label}</span>
                <span className="font-black text-slate-900">{f.value}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${f.value}%`, backgroundColor: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why This Career Fits You */}
      <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 sm:p-4.5 space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Why This Career Fits You</span>
        </h3>
        {whyFits.length > 0 ? (
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {whyFits.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic py-1">
            Target career compatibility telemetry will generate automatically once you select a career from recommendations or complete your diagnostic assessment.
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <Link
          href="/recommendations"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px] items-center group cursor-pointer"
        >
          <span>View Full Analysis</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
