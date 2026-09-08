'use client';

import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  BookOpen,
  HelpCircle,
  Compass,
} from 'lucide-react';

interface AssessmentOverviewProps {
  onStart: () => void;
  hasInProgress: boolean;
  answeredCount: number;
  totalQuestions: number;
}

export function AssessmentOverview({
  onStart,
  hasInProgress,
  answeredCount,
  totalQuestions,
}: AssessmentOverviewProps) {
  const dimensions = [
    {
      title: 'Logical Reasoning',
      desc: 'Pattern recognition, deductive syllogisms, and sequencing',
      count: '5 questions',
    },
    {
      title: 'Quantitative Ability',
      desc: 'Throughput arithmetic, system scaling, and normal distributions',
      count: '5 questions',
    },
    {
      title: 'Verbal Reasoning',
      desc: 'Technical clarity, grammatical agreement, and terminology',
      count: '5 questions',
    },
    {
      title: 'Analytical Thinking',
      desc: 'Telemetry hypotheses, cascading error propagation, and precision/recall',
      count: '5 questions',
    },
    {
      title: 'Problem Solving',
      desc: 'Production bottleneck isolation, race condition mitigation, and architecture',
      count: '5 questions',
    },
  ];

  const outcomes = [
    {
      icon: Target,
      title: 'Identify Core Strengths',
      desc: 'Pinpoint cognitive dimensions where you excel compared to tech industry benchmarks.',
    },
    {
      icon: BarChart3,
      title: 'Calibrate Career Compatibility',
      desc: 'Directly adjusts ML match scores across 20+ software engineering pathways.',
    },
    {
      icon: Sparkles,
      title: 'Detect Skill & Reasoning Gaps',
      desc: 'Translates test diagnostic telemetry into verified skill evidence and priority gaps.',
    },
    {
      icon: BookOpen,
      title: 'Personalize Learning Roadmap',
      desc: 'Generates targeted practice milestones tailored to your developmental opportunities.',
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
          <Compass className="h-3.5 w-3.5" />
          <span>STANDARDIZED DIAGNOSTIC BATTERY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          CAREER FIT ASSESSMENT
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          This comprehensive diagnostic evaluates 5 critical reasoning dimensions required for high-velocity software engineering and analytical leadership.
        </p>
      </div>

      {/* 5 Evaluated Dimensions */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          EVALUATED DIMENSIONS (25 QUESTIONS TOTAL)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-900">{dim.title}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                  {dim.count}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-6">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Downstream Impact */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          HOW CAREERAI USES YOUR RESULTS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outcomes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-100 bg-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">{item.title}</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>Estimated time: 15–20 minutes • Answers autosave continuously</span>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5"
        >
          <span>{hasInProgress ? `Continue Assessment (${answeredCount}/${totalQuestions})` : 'Start Assessment'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
