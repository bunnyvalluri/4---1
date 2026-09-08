'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { CareerTarget } from '@/lib/hooks/useSkillIntelligence';

interface CareerTargetBarProps {
  targetCareer?: CareerTarget;
  availableCareers?: CareerTarget[];
  onChangeCareer: (careerId: string) => void;
}

export function CareerTargetBar({
  targetCareer,
  availableCareers = [],
  onChangeCareer,
}: CareerTargetBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!targetCareer) return null;

  return (
    <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        {/* Left info */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[11px] font-bold text-blue-800">
            <Target className="h-3 w-3 text-blue-700" />
            <span>ACTIVE TARGET BENCHMARK</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{targetCareer.title}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {targetCareer.match_score}% Match
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600">
            {targetCareer.category} • Market Band: <span className="font-semibold text-slate-800">{targetCareer.salary_range}</span>
          </p>
        </div>

        {/* Middle Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Required Skills
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-800">
              {targetCareer.required_skills_count}
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Your Skills
            </div>
            <div className="text-base sm:text-lg font-extrabold text-blue-600">
              {targetCareer.user_skills_count}
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Skill Coverage
            </div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-600">
              {targetCareer.skill_coverage_pct}%
            </div>
          </div>
        </div>

        {/* Right: Change Career Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-blue-500 text-slate-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <span>Change Career</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Select Benchmark Track
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {availableCareers.map((c) => {
                  const isSelected = c.id === targetCareer.id || c.slug === targetCareer.slug;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onChangeCareer(c.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate font-semibold">{c.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{c.category}</div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                          {c.match_score}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
