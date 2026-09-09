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
  const hasTakenAssessment = !!(
    assessment &&
    assessment.overall_score &&
    assessment.overall_score > 0 &&
    Array.isArray(assessment.radar_data) &&
    assessment.radar_data.length > 0
  );

  const data: AssessmentData = assessment || {
    radar_data: [],
    top_strength: 'Pending Diagnostic',
    growth_area: 'Pending Diagnostic',
    overall_score: 0,
    benchmark: 70,
    status: 'Not Taken',
  };

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
            {hasTakenAssessment ? 'Retake Diagnostic →' : 'Start Diagnostic →'}
          </Link>
        </div>
      </div>

      {hasTakenAssessment ? (
        /* Grid: Vertical stack on mobile, 5-col on desktop */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          {/* Radar Chart Container */}
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
      ) : (
        <div className="py-10 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto border border-indigo-200/80">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Cognitive Diagnostic Not Completed</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Complete the 25-question aptitude evaluation to map your dimensional radar across Logical, Quantitative, Verbal, Analytical, and Problem-Solving proficiencies.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[40px]"
            >
              Start Diagnostic Assessment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
