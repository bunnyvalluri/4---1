'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { CriticalGapItem } from '@/lib/hooks/useSkillIntelligence';

interface CriticalSkillGapsProps {
  gaps: CriticalGapItem[];
}

export function CriticalSkillGaps({ gaps = [] }: CriticalSkillGapsProps) {
  if (gaps.length === 0) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center space-y-2">
        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          ✓
        </div>
        <h3 className="text-base sm:text-lg font-black text-emerald-900">
          No Critical Skill Gaps Detected
        </h3>
        <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
          Your recorded technical proficiency meets or exceeds the core benchmarks for your current career target!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-600" />
            <span>SKILLS TO FOCUS ON</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Highest-ROI capabilities to bridge for maximum shortlisting fidelity and interview clearance.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          {gaps.length} Priority Gaps
        </span>
      </div>

      {/* Grid of Critical Gap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gaps.map((gap) => (
          <div
            key={gap.skill}
            className="rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header: Number & Severity */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                  {gap.rank < 10 ? `0${gap.rank}` : gap.rank}
                </span>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    gap.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {gap.gap_severity} Gap
                </span>
              </div>

              {/* Title & Category */}
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {gap.skill}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  {gap.category}
                </span>
              </div>

              {/* Current vs Target Pills */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current
                  </div>
                  <div className="font-bold text-slate-700">{gap.current_level}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Target
                  </div>
                  <div className="font-extrabold text-blue-600">{gap.target_level}</div>
                </div>
              </div>

              {/* Why it matters */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Why it matters
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {gap.why_it_matters}
                </p>
              </div>

              {/* Recommended & Duration */}
              <div className="space-y-1 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                  <BookOpen className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{gap.recommended_module}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Estimated: {gap.estimated_duration}</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <Link
              href={gap.action_url || '/roadmap'}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Learning</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
