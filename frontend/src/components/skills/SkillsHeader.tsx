'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SkillsHeaderProps {
  onAddSkill: () => void;
  onRecalculate: () => void;
  isSyncing: boolean;
  isAnalyzing: boolean;
  lastUpdatedText: string;
}

export function SkillsHeader({
  onAddSkill,
  onRecalculate,
  isSyncing,
  isAnalyzing,
  lastUpdatedText,
}: SkillsHeaderProps) {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Subtle background ambient accent */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-50/70 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Title & Description */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>AI Skill Intelligence Center</span>
            </div>

            {/* Real-time Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="relative flex h-2 w-2">
                {isAnalyzing ? (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                ) : (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isAnalyzing
                      ? 'bg-amber-500'
                      : isSyncing
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span>
                {isAnalyzing
                  ? 'Analyzing skill profile...'
                  : isSyncing
                  ? 'Syncing telemetry...'
                  : 'Skills synced'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">Last updated: {lastUpdatedText}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            SKILL INTELLIGENCE
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Understand your strengths, identify the skills your target career requires, and build the capabilities you need to move forward.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRecalculate}
            disabled={isSyncing || isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Recalculate skill gaps & alignment telemetry"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-600 ${isSyncing || isAnalyzing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Update Skills</span>
          </button>

          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
          >
            <span>View Career Match</span>
            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
          </Link>

          <button
            type="button"
            onClick={onAddSkill}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
