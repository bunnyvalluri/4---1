'use client';

import React from 'react';
import { TrendingUp, Clock, Info } from 'lucide-react';
import { SkillHistoricalPoint } from '@/lib/hooks/useSkillIntelligence';

interface SkillTrendProps {
  trend: SkillHistoricalPoint[];
}

export function SkillTrendSection({ trend = [] }: SkillTrendProps) {
  if (trend.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            SKILL PROGRESS OVER TIME
          </h2>
        </div>
        <div className="py-8 px-4 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
          <Clock className="h-7 w-7 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">
            Skill trend will appear as you build your profile.
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            As you complete milestones, take diagnostics, and update competencies, chronological telemetry benchmarks will visualize here.
          </p>
        </div>
      </div>
    );
  }

  // Group trend by skill
  const skillGroups: Record<string, SkillHistoricalPoint[]> = {};
  trend.forEach((pt) => {
    if (!skillGroups[pt.skill]) skillGroups[pt.skill] = [];
    skillGroups[pt.skill].push(pt);
  });

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>SKILL PROGRESS OVER TIME</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Empirical velocity progression based on logged milestone completions.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span>Verified Velocity</span>
        </div>
      </div>

      {/* Visual Bars for Key Competencies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(skillGroups).map(([skillName, points]) => {
          const latest = points[points.length - 1];
          const first = points[0];
          const delta = latest.proficiency_pct - first.proficiency_pct;

          return (
            <div
              key={skillName}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{skillName}</span>
                <span className="text-xs font-bold text-emerald-600">
                  +{delta}% Growth
                </span>
              </div>

              {/* Steps progression */}
              <div className="space-y-2 pt-1">
                {points.map((pt, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{pt.period}</span>
                      <span className="font-bold text-slate-700">{pt.proficiency_pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${pt.proficiency_pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
