'use client';

import React from 'react';
import { Award, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { RoadmapData } from '@/lib/types/roadmap';

interface CurrentProgressProps {
  roadmap: RoadmapData;
}

export function CurrentProgress({ roadmap }: CurrentProgressProps) {
  const overall = Math.round(roadmap.progress_percent || 0);
  const completedItems = (roadmap.items || []).filter((i) => i.is_completed).length;
  const totalItems = (roadmap.items || []).length || 12;
  const completedHours = Math.round(roadmap.completed_hours || 0);
  const totalHours = Math.round(roadmap.estimated_total_hours || 120);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Execution Progress
            </h3>
            <div className="text-sm font-bold text-slate-800">
              {overall}% Curriculum Complete
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {completedItems} of {totalItems} Milestones
        </span>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
          <span>Overall Curriculum</span>
          <span className="text-blue-600 font-bold">{overall}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overall)}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Time Invested</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {completedHours}h <span className="text-xs text-slate-400 font-normal">/ {totalHours}h</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Award className="h-3.5 w-3.5 text-slate-400" />
            <span>Verified Proofs</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {completedItems} <span className="text-xs text-slate-400 font-normal">Items Done</span>
          </div>
        </div>
      </div>

      {/* Phase-by-Phase Mini Progress Bars */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Phase Progression
        </div>
        {(roadmap.phases || []).map((p) => {
          const pct = Math.round(p.progress_percent || 0);
          return (
            <div key={p.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                  Month {p.month}: {p.title.replace(/Phase \d+:\s*/i, '')}
                </span>
                <span className={`font-bold ${pct >= 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
