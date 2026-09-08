'use client';

import React, { useState } from 'react';
import { Check, Flag, LayoutGrid, X } from 'lucide-react';
import { AssessmentQuestion } from '@/lib/hooks/useAssessment';

interface QuestionNavigatorProps {
  questions: AssessmentQuestion[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Set<string>;
  onSelectQuestion: (index: number) => void;
  onReview?: () => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  flagged,
  onSelectQuestion,
  onReview,
}: QuestionNavigatorProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const renderGrid = () => (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((q, idx) => {
        const isCurrent = idx === currentIndex;
        const isAnswered = answers[q.id] !== undefined;
        const isFlagged = flagged.has(q.id);

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              onSelectQuestion(idx);
              setMobileDrawerOpen(false);
            }}
            className={`h-10 w-full rounded-xl text-xs font-extrabold transition-all relative flex items-center justify-center border ${
              isCurrent
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 ring-2 ring-blue-400/40 ring-offset-1 z-10'
                : isAnswered
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{idx + 1}</span>

            {/* Flag Indicator Badge */}
            {isFlagged && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border border-white flex items-center justify-center">
                <Flag className="h-1.5 w-1.5 fill-white text-white" />
              </span>
            )}

            {/* Answered check mark */}
            {isAnswered && !isCurrent && (
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>
        );
      })}
    </div>
  );

  const legend = (
    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-md bg-blue-600" />
        <span>Current</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-md bg-emerald-100 border border-emerald-300" />
        <span>Answered</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-md bg-amber-100 border border-amber-300" />
        <span>Flagged</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-md bg-white border border-slate-200" />
        <span>Unanswered</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <div className="lg:hidden w-full">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-blue-600" />
            <span>Question Navigator</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {currentIndex + 1} / {questions.length}
          </span>
        </button>
      </div>

      {/* Desktop Persistent Sidebar Panel */}
      <div className="hidden lg:block rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 w-72 shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            <LayoutGrid className="h-4 w-4 text-blue-600" />
            <span>Navigator</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {Object.keys(answers).length} / {questions.length}
          </span>
        </div>

        {renderGrid()}

        {legend}

        {onReview && (
          <button
            type="button"
            onClick={onReview}
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Review All Questions
          </button>
        )}
      </div>

      {/* Mobile Drawer / Bottom Sheet Modal */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Question Navigator</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderGrid()}

            {legend}

            {onReview && (
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onReview();
                }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-sm shadow-blue-500/20"
              >
                Review All Questions
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
