'use client';

import React from 'react';
import Link from 'next/link';
import { Target, ArrowRight } from 'lucide-react';
import { SkillGapItem } from '@/lib/hooks/useDashboardRealtime';

interface SkillGapCardProps {
  gaps?: SkillGapItem[];
}

export function SkillGapCard({ gaps = [] }: SkillGapCardProps) {
  const items = gaps;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Target className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="truncate">Your Biggest Career Gaps</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
            Competencies required to reach target benchmark
          </p>
        </div>
        {items.length > 0 && (
          <Link
            href="/skills"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0 min-h-[44px] flex items-center"
          >
            View All Gaps →
          </Link>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-3 pt-1">
          {items.map((gap) => {
            const isHigh = gap.priority.includes('HIGH');

            return (
              <div
                key={gap.name}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 hover:bg-white hover:border-slate-300 transition-all space-y-3 min-w-0"
              >
                {/* Top: Priority Pill + Skill Name */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isHigh
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {gap.priority}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 break-words">
                        {gap.name}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-500">
                      Current: <span className="font-bold text-slate-700">{gap.currentLevel}</span> • Target:{' '}
                      <span className="font-bold text-blue-700">{gap.targetLevel}</span>
                    </div>
                  </div>

                  {/* Desktop Action Button */}
                  <Link
                    href="/roadmap"
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Progress Gap Visualization Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>Candidate: <strong className="text-slate-900">{gap.currentScore}%</strong></span>
                    <span>Target: <strong className="text-amber-700">{gap.targetScore}%</strong></span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                    {/* Current progress */}
                    <div
                      className="h-full bg-blue-600 rounded-full absolute left-0 top-0 transition-all duration-500"
                      style={{ width: `${gap.currentScore}%` }}
                    />
                    {/* Target benchmark pin */}
                    <div
                      className="h-full w-1.5 bg-amber-500 absolute top-0 z-10"
                      style={{ left: `${gap.targetScore}%` }}
                      title={`Target: ${gap.targetScore}%`}
                    />
                  </div>
                </div>

                {/* Mobile Action Button */}
                <div className="pt-1 sm:hidden">
                  <Link
                    href="/roadmap"
                    className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/80 transition-all active:scale-[0.98]"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto border border-rose-200/80">
            <Target className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">No Skill Gaps Identified</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select a target career or upload your resume to benchmark your current skills against industry requirements.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/careers"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[38px]"
            >
              Browse Careers
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors min-h-[38px]"
            >
              Upload Resume
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
