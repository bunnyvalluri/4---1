'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Flag, Sparkles } from 'lucide-react';
import { AssessmentQuestion } from '@/lib/hooks/useAssessment';
import { AnswerOption } from './AnswerOption';
import { SaveStatus } from './SaveStatus';
import { SaveState } from '@/lib/hooks/useAssessment';

interface QuestionCardProps {
  question: AssessmentQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOption?: number;
  isFlagged: boolean;
  saveStatus: SaveState;
  lastSaved?: Date | null;
  onSelectOption: (optIdx: number) => void;
  onToggleFlag: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReview: () => void;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  isFlagged,
  saveStatus,
  lastSaved,
  onSelectOption,
  onToggleFlag,
  onPrev,
  onNext,
  onReview,
}: QuestionCardProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isAnswered = selectedOption !== undefined;

  const getCategoryTheme = (cat: string) => {
    const c = (cat || '').toUpperCase();
    if (c.includes('LOGICAL')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (c.includes('QUANTITATIVE')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (c.includes('VERBAL')) return 'bg-violet-50 text-violet-700 border-violet-200';
    if (c.includes('ANALYTICAL')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 sm:p-10 shadow-xs space-y-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[11px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${getCategoryTheme(
              question.category
            )}`}
          >
            {question.category?.replace('_', ' ')}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Difficulty: {question.difficulty}
          </span>
        </div>

        {/* Flag Question Button */}
        <button
          type="button"
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
            isFlagged
              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
          <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
        </button>
      </div>

      {/* Question Statement */}
      <div className="space-y-2">
        <div className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
          QUESTION {currentIndex + 1} OF {totalQuestions}
        </div>
        <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug break-words">
          {question.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 pt-2">
        {question.options.map((optText, optIdx) => (
          <AnswerOption
            key={optIdx}
            index={optIdx}
            text={optText}
            isSelected={selectedOption === optIdx}
            onSelect={() => onSelectOption(optIdx)}
          />
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        {/* Left: Previous + Save Status */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <SaveStatus status={saveStatus} lastSaved={lastSaved} />
        </div>

        {/* Right: Next or Review */}
        <div className="w-full sm:w-auto">
          {isLastQuestion ? (
            <button
              type="button"
              onClick={onReview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all hover:-translate-y-0.5 min-h-[44px]"
            >
              <span>Review Assessment</span>
              <Sparkles className="h-4 w-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5 min-h-[44px]"
            >
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
