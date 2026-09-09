'use client';

import React from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { AssessmentData } from '@/lib/hooks/useDashboardRealtime';

interface AssessmentOverviewProps {
  assessment?: AssessmentData | null;
}

export function AssessmentOverview({ assessment }: AssessmentOverviewProps) {
  const defaultAssessment: AssessmentData = {
    radar_data: [
      { subject: 'Logical', score: 82 },
      { subject: 'Quantitative', score: 76 },
      { subject: 'Verbal', score: 88 },
      { subject: 'Analytical', score: 91 },
      { subject: 'Problem Solving', score: 84 },
    ],
    top_strength: 'Analytical Reasoning (91%)',
    growth_area: 'Quantitative Aptitude (76%)',
    overall_score: 84,
    benchmark: 70,
    status: 'Diagnostic Verified',
  };

  const data = assessment || defaultAssessment;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Assessment Performance</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Evaluated across 5 foundational cognitive dimensions
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Benchmark: 70%+
          </span>
          <Link
            href="/assessment"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 min-h-[44px] flex items-center"
          >
            Retake Diagnostic →
          </Link>
        </div>
      </div>

      {/* Grid: Vertical stack on mobile (chart first, then insights), 5-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* Radar Chart Container: Min height 260px on mobile to ensure readable axes */}
        <div className="lg:col-span-3 h-64 sm:h-72 w-full min-w-0 overflow-hidden relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <RadarChart data={data.radar_data} margin={{ top: 15, right: 25, bottom: 15, left: 25 }}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#CBD5E1"
                tick={{ fontSize: 9 }}
              />
              <Radar
                name="Candidate"
                dataKey="score"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fill="#4F46E5"
                fillOpacity={0.22}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Summary & Strength Cards */}
        <div className="lg:col-span-2 space-y-3 min-w-0">
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
              <Zap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Top Strength</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">{data.top_strength}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
              <TrendingUp className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Growth Opportunity</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">{data.growth_area}</div>
          </div>

          {/* Dimension Scores */}
          <div className="pt-2 space-y-2 border-t border-slate-100">
            {data.radar_data.map((item) => (
              <div key={item.subject} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{item.subject}</span>
                <span className="font-black text-slate-900">{item.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
