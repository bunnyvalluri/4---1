'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  FileCheck,
  BrainCircuit,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface SkillsEmptyStateProps {
  onAddSkill: () => void;
  skillCount?: number;
}

export function SkillsEmptyState({
  onAddSkill,
  skillCount = 0,
}: SkillsEmptyStateProps) {
  // If user has some skills but profile is partial
  if (skillCount > 0 && skillCount < 5) {
    return (
      <div className="rounded-3xl border border-blue-200/90 bg-blue-50/50 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              You have {skillCount} skill{skillCount > 1 ? 's' : ''} recorded.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Adding 5 or more competencies unlocks comprehensive multi-factor career benchmarking and AI gap priority telemetry.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddSkill}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
          >
            Add More Skills
          </button>
        </div>
      </div>
    );
  }

  // Pure Empty State
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs text-center space-y-6 max-w-2xl mx-auto my-6">
      <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs border border-blue-100">
        <Sparkles className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          BUILD YOUR SKILL PROFILE
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Add your technical competencies to unlock intelligent real-time career matching, gap telemetry, and custom roadmap velocity.
        </p>
      </div>

      {/* Feature bullets */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left text-xs text-slate-700 font-semibold pt-2">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Career matching</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Skill-gap analysis</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Personalized roadmap</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Project recommendations</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddSkill}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Your First Skill</span>
        </button>
      </div>

      {/* Secondary Fast Onboarding Channels */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 text-xs">
        <Link
          href="/resume"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-700 font-bold p-2 hover:bg-slate-50 rounded-xl transition-all"
        >
          <FileCheck className="h-4 w-4 text-emerald-600" />
          <span>Import from Resume ATS Scanner</span>
          <ArrowRight className="h-3 w-3" />
        </Link>

        <span className="text-slate-300 hidden sm:inline">•</span>

        <Link
          href="/assessment"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-700 font-bold p-2 hover:bg-slate-50 rounded-xl transition-all"
        >
          <BrainCircuit className="h-4 w-4 text-purple-600" />
          <span>Take Diagnostic Assessment</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
