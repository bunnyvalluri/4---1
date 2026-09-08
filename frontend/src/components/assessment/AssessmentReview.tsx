'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Flag,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { AssessmentQuestion } from '@/lib/hooks/useAssessment';
import { SubmitConfirmationDialog } from './SubmitConfirmationDialog';

interface AssessmentReviewProps {
  questions: AssessmentQuestion[];
  answers: Record<string, number>;
  flagged: Set<string>;
  categorySummary: Record<string, { answered: number; total: number }>;
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
  onBackToTest: () => void;
  submitting?: boolean;
}

export function AssessmentReview({
  questions,
  answers,
  flagged,
  categorySummary,
  onSelectQuestion,
  onSubmit,
  onBackToTest,
  submitting = false,
}: AssessmentReviewProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const flaggedCount = flagged.size;

  const sections = [
    { key: 'LOGICAL', label: 'Logical Reasoning' },
    { key: 'QUANTITATIVE', label: 'Quantitative' },
    { key: 'VERBAL', label: 'Verbal' },
    { key: 'ANALYTICAL', label: 'Analytical' },
    { key: 'PROBLEM_SOLVING', label: 'Problem Solving' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              PRE-SUBMISSION VERIFICATION
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              ASSESSMENT REVIEW
            </h2>
            <p className="text-xs text-slate-500">
              Review all responses before final submission. Click any question to change your answer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToTest}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Assessment</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all hover:-translate-y-0.5"
            >
              <span>Submit Assessment</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-emerald-800">{answeredCount}</div>
              <div className="text-xs font-bold text-emerald-700">Answered Questions</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500/80" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className={`text-2xl font-black ${unansweredCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                {unansweredCount}
              </div>
              <div className="text-xs font-bold text-slate-600">Unanswered Questions</div>
            </div>
            <HelpCircle className="h-8 w-8 text-slate-400" />
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div>
              <div className={`text-2xl font-black ${flaggedCount > 0 ? 'text-amber-800' : 'text-slate-400'}`}>
                {flaggedCount}
              </div>
              <div className="text-xs font-bold text-amber-700">Flagged for Review</div>
            </div>
            <Flag className="h-8 w-8 text-amber-500/80" />
          </div>
        </div>

        {/* Section Completion Breakdown */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            SECTION PROGRESS BREAKDOWN
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {sections.map((sec) => {
              const stats = categorySummary[sec.key] || { answered: 0, total: 5 };
              const isAllDone = stats.answered >= stats.total && stats.total > 0;
              return (
                <div
                  key={sec.key}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-1"
                >
                  <div className="text-xs font-bold text-slate-800 truncate">{sec.label}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">
                      {stats.answered} / {stats.total}
                    </span>
                    {isAllDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Question List */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            ALL QUESTIONS ({totalQuestions})
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {questions.map((q, idx) => {
              const isAns = answers[q.id] !== undefined;
              const isFlg = flagged.has(q.id);
              const selectedOptIdx = answers[q.id];
              const selectedLetter = selectedOptIdx !== undefined ? String.fromCharCode(65 + selectedOptIdx) : null;

              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(idx)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-2">
                    <span
                      className={`h-7 w-7 shrink-0 rounded-xl text-xs font-bold flex items-center justify-center ${
                        isAns ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 uppercase">
                          {q.category?.replace('_', ' ')}
                        </span>
                        {isFlg && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            <Flag className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            <span>Flagged</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-900 truncate max-w-xl group-hover:text-blue-600 transition-colors">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  {/* Right Status / Action */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {isAns ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Option {selectedLetter}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/60">
                        <span>Unanswered</span>
                      </span>
                    )}

                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Edit</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToTest}
            className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ← Return to Assessment
          </button>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-xs font-extrabold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all hover:-translate-y-0.5"
          >
            <span>Submit Assessment</span>
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SubmitConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onSubmit();
        }}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedCount}
        submitting={submitting}
      />
    </div>
  );
}
