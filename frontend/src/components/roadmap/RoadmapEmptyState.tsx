'use client';

import React, { useState } from 'react';
import { Route, Sparkles, ArrowRight, Compass, Clock, Check } from 'lucide-react';
import { LearningPace } from '@/lib/types/roadmap';

interface RoadmapEmptyStateProps {
  careers: Array<{ id: string; title: string }>;
  onBuild: (careerId: string, hours: number, pace: LearningPace) => void;
  loading: boolean;
}

export function RoadmapEmptyState({ careers, onBuild, loading }: RoadmapEmptyStateProps) {
  const [selectedCareerId, setSelectedCareerId] = useState(careers[0]?.id || 'c-fs');
  const [hours, setHours] = useState(10);
  const [pace, setPace] = useState<LearningPace>('balanced');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuild(selectedCareerId, hours, pace);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
          <Route className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Curriculum Engine</span>
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Your Personalized Roadmap is Ready to Build
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Synthesize a structured 6-month curriculum calibrated directly from your verified skills, diagnostic assessment results, and target career standards.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Select Target Career
            </label>
            <select
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                Weekly Hours
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value={5}>5 hrs/week (Flexible)</option>
                <option value={10}>10 hrs/week (Balanced)</option>
                <option value={20}>20 hrs/week (Fast Track)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                Learning Pace
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value as LearningPace)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value="balanced">Balanced Progression</option>
                <option value="fast_track">Intensive Fast-Track</option>
                <option value="flexible">Self-Paced Flexible</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Synthesizing Curriculum...' : 'Build My Personalized Roadmap'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
