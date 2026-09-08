'use client';

import React from 'react';
import { Flag, CheckCircle2, HelpCircle } from 'lucide-react';

interface AssessmentProgressProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
}

export function AssessmentProgress({
  currentIndex,
  totalQuestions,
  answeredCount,
  flaggedCount,
}: AssessmentProgressProps) {
  const currentQuestionNumber = currentIndex + 1;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const remainingCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 text-sm">
            Question {currentQuestionNumber} of {totalQuestions}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            {progressPercent}% complete
          </span>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="h-3 w-3" />
            <span>Answered: {answeredCount}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/60">
            <HelpCircle className="h-3 w-3" />
            <span>Remaining: {remainingCount}</span>
          </span>

          {flaggedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
              <Flag className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>Flagged: {flaggedCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
