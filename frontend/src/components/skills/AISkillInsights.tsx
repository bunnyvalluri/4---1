'use client';

import React from 'react';
import { Sparkles, BrainCircuit, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { AISkillInsights } from '@/lib/hooks/useSkillIntelligence';

interface AISkillInsightsProps {
  insights?: AISkillInsights;
}

export function AISkillInsightsCard({ insights }: AISkillInsightsProps) {
  if (!insights) return null;

  return (
    <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              AI SKILL INSIGHTS
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time cognitive synthesis derived directly from your empirical telemetry.
            </p>
          </div>
        </div>

        {/* AI Confidence Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-200 shadow-2xs text-xs font-bold text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>AI Confidence: <strong className="text-blue-700">{insights.confidence_level}</strong></span>
        </div>
      </div>

      {/* Grid of Key AI Findings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Strongest Area
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {insights.strongest_area}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Biggest Current Gap
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {insights.biggest_gap}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Career Alignment Driver
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {insights.career_alignment_driver}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Next Strategic Focus
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {insights.next_priority}
          </p>
        </div>
      </div>

      {/* Confidence explanation footer */}
      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span>Rationale: {insights.confidence_reason}</span>
      </div>
    </div>
  );
}
