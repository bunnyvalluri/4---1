'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Compass,
  Sparkles,
  Brain,
  FileText,
  Activity,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Platform Analytics & Intelligence</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical growth, candidate completion curves, career match demand, and skill gap distribution.
        </p>
      </div>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Career Demand Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Career Match Demand Distribution
            </h2>
          </div>

          <div className="space-y-4">
            {(data?.top_career_demand || [
              { career: 'AI / Machine Learning Engineer', interest_pct: 38, avg_match: 84 },
              { career: 'Full Stack Cloud Engineer', interest_pct: 29, avg_match: 88 },
              { career: 'DevOps & MLOps Architect', interest_pct: 18, avg_match: 76 },
              { career: 'Data Science Specialist', interest_pct: 15, avg_match: 81 },
            ]).map((item: any) => (
              <div key={item.career} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{item.career}</span>
                  <span className="font-semibold text-slate-600">{item.interest_pct}% ({item.avg_match}% Match)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.interest_pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Frequent Skill Gaps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Brain className="h-4 w-4 text-amber-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Most Frequent Candidate Skill Gaps
            </h2>
          </div>

          <div className="space-y-3">
            {(data?.skill_gap_frequency || [
              { skill: 'Docker & Container Architecture', gap_count: 64 },
              { skill: 'System Design & Scalability', gap_count: 52 },
              { skill: 'CI/CD Automated Pipelines', gap_count: 48 },
              { skill: 'PostgreSQL Query Optimization', gap_count: 39 },
              { skill: 'Kubernetes Cluster Orchestration', gap_count: 35 },
            ]).map((gap: any) => (
              <div
                key={gap.skill}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-semibold text-slate-800">{gap.skill}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {gap.gap_count} candidates
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
