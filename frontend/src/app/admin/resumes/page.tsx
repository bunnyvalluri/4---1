'use client';

import React from 'react';
import { FileText, TrendingUp, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export default function AdminResumesPage() {
  const missingSkills = [
    { skill: 'Docker & Containerization', count: 184, percentage: 68 },
    { skill: 'Kubernetes & Orchestration', count: 152, percentage: 56 },
    { skill: 'CI/CD Automated Pipelines', count: 141, percentage: 52 },
    { skill: 'System Architecture & Scalability', count: 122, percentage: 45 },
    { skill: 'Cloud Monitoring & Telemetry', count: 98, percentage: 36 },
  ];

  const commonIssues = [
    { issue: 'Lack of quantifiable impact metrics (e.g. "improved latency by 30%")', occurrences: '72% of submissions' },
    { issue: 'Unstandardized section headings failing ATS regex parsers', occurrences: '54% of submissions' },
    { issue: 'Missing essential keyword density for target career roles', occurrences: '48% of submissions' },
    { issue: 'Multi-column layouts causing text extraction ordering scrambling', occurrences: '38% of submissions' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Aggregate Resume & ATS Intelligence</h1>
        <p className="text-xs text-slate-500 mt-1">
          Least-privilege aggregate analytics evaluating candidate ATS readiness, missing skill clusters, and structural pitfalls.
        </p>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">TOTAL RESUMES ANALYZED</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">632</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all candidate cohorts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">AVERAGE ATS MATCH SCORE</p>
          <p className="text-2xl font-extrabold text-teal-600 mt-2">78.4%</p>
          <p className="text-[11px] text-slate-500 mt-1">+4.2% after roadmap completion</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">TOP CAREER TARGET</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">AI / ML Engineer</p>
          <p className="text-[11px] text-slate-500 mt-1">38% of all candidate uploads</p>
        </div>
      </div>

      {/* Grid: Missing Skills & Common Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Most Common Skills Missing from Candidate Resumes
          </h2>
          <div className="space-y-3">
            {missingSkills.map((ms) => (
              <div key={ms.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{ms.skill}</span>
                  <span className="font-bold text-slate-600">{ms.count} resumes ({ms.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${ms.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Frequent Formatting & Content Deficiencies
          </h2>
          <div className="space-y-3">
            {commonIssues.map((ci, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <p className="font-bold text-slate-900">{ci.issue}</p>
                <p className="text-[11px] font-semibold text-rose-600">{ci.occurrences}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
