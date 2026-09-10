'use client';

import React from 'react';
import { Route, Play, Settings2, RefreshCw, Calendar, Clock, CheckCircle } from 'lucide-react';
import { RoadmapData } from '@/lib/types/roadmap';

interface RoadmapHeaderProps {
  roadmap: RoadmapData;
  onContinue: () => void;
  onCustomize: () => void;
  onRegenerate: () => void;
}

export function RoadmapHeader({ roadmap, onContinue, onCustomize, onRegenerate }: RoadmapHeaderProps) {
  const isComplete = roadmap.progress_percent >= 100;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Top subtle accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/90 text-xs font-bold text-blue-700">
              <Route className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Personalized Career Roadmap</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {roadmap.status === 'ACTIVE' ? 'Active Curriculum' : roadmap.status}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700">
              12-Week Resume Grounded
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
              W3Schools & GeeksforGeeks Verified
            </span>

            <span className="text-xs font-semibold text-slate-400">
              Roadmap V{roadmap.version || 1}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-words">
            {roadmap.career_title || roadmap.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
            A step-by-step learning and project plan synthesized from your verified skills, diagnostic assessment results, career targets, and identified competency gaps.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{roadmap.hours_per_week || 10} hrs/week ({roadmap.learning_pace === 'fast_track' ? 'Fast Track' : roadmap.learning_pace === 'flexible' ? 'Flexible' : 'Balanced'})</span>
            </div>

            {roadmap.estimated_completion_date && (
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Est. Completion: <strong className="text-slate-800 font-semibold">{roadmap.estimated_completion_date}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Header Actions & Progress Metric */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0">
          <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 w-full sm:w-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {Math.round(roadmap.progress_percent)}%
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Curriculum Progress
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-800">
                {Math.round(roadmap.completed_hours || 0)} / {Math.round(roadmap.estimated_total_hours || 120)}h
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Logged Hours
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isComplete ? <CheckCircle className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
              <span>{isComplete ? 'Review Milestones' : 'Continue Roadmap'}</span>
            </button>

            <button
              type="button"
              onClick={onCustomize}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <Settings2 className="h-4 w-4 text-slate-500" />
              <span>Customize</span>
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
