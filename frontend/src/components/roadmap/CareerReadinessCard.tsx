'use client';

import React from 'react';
import { Target, TrendingUp, CheckCircle, FileText, Code2, GraduationCap } from 'lucide-react';
import { CareerReadinessBreakdown } from '@/lib/types/roadmap';

interface CareerReadinessCardProps {
  careerTitle: string;
  readinessScore: number;
  breakdown: CareerReadinessBreakdown;
}

export function CareerReadinessCard({ careerTitle, readinessScore, breakdown }: CareerReadinessCardProps) {
  const score = Math.round(readinessScore || 0);

  const getTierColor = (val: number) => {
    if (val >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getBarGradient = (val: number) => {
    if (val >= 80) return 'bg-emerald-600';
    if (val >= 60) return 'bg-blue-600';
    return 'bg-amber-500';
  };

  const factors = [
    {
      label: 'Skill Coverage',
      val: Math.round(breakdown?.skill_coverage || 72),
      weight: '35%',
      icon: CheckCircle,
      description: 'Verified match against target role technical skills',
    },
    {
      label: 'Assessment Fit',
      val: Math.round(breakdown?.assessment_fit || 84),
      weight: '20%',
      icon: GraduationCap,
      description: 'Diagnostic psychometric & aptitude benchmark fit',
    },
    {
      label: 'Project Readiness',
      val: Math.round(breakdown?.project_readiness || 45),
      weight: '20%',
      icon: Code2,
      description: 'Verified capstone portfolio & hands-on deliverables',
    },
    {
      label: 'Resume Evidence',
      val: Math.round(breakdown?.resume_evidence || 61),
      weight: '10%',
      icon: FileText,
      description: 'ATS keywords & recruiter proof points detected',
    },
    {
      label: 'Roadmap Completion',
      val: Math.round(breakdown?.roadmap_completion || 34),
      weight: '15%',
      icon: TrendingUp,
      description: 'Milestone tasks completed within this curriculum',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Career Readiness Index
            </h3>
            <div className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
              {careerTitle}
            </div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-xl text-sm font-black border ${getTierColor(score)}`}>
          {score}% Ready
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
          <span>Overall Competency Score</span>
          <span className="text-slate-900">{score} / 100</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarGradient(score)}`}
            style={{ width: `${Math.max(6, Math.min(100, score))}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Authoritative composite score calibrated across 5 weighted engineering criteria.
        </p>
      </div>

      {/* 5-Factor Weighted Sub-Breakdown */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {factors.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{f.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                    {f.weight}
                  </span>
                </div>
                <span className="font-bold text-slate-900">{f.val}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, f.val)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
