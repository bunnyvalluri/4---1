'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface AssessmentSectionProgressProps {
  currentCategory: string;
  categorySummary: Record<string, { answered: number; total: number }>;
  onSelectCategory?: (category: string) => void;
}

export function AssessmentSectionProgress({
  currentCategory,
  categorySummary,
  onSelectCategory,
}: AssessmentSectionProgressProps) {
  const sections = [
    { key: 'LOGICAL', label: 'Logical Reasoning' },
    { key: 'QUANTITATIVE', label: 'Quantitative' },
    { key: 'VERBAL', label: 'Verbal' },
    { key: 'ANALYTICAL', label: 'Analytical' },
    { key: 'PROBLEM_SOLVING', label: 'Problem Solving' },
  ];

  const normCurrent = currentCategory?.toUpperCase().replace('-', '_') || 'LOGICAL';

  return (
    <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
      <div className="flex items-center gap-2 min-w-max">
        {sections.map((sec) => {
          const stats = categorySummary[sec.key] || { answered: 0, total: 5 };
          const isActive = normCurrent === sec.key;
          const isComplete = stats.answered >= stats.total && stats.total > 0;

          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(sec.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-bold'
                  : isComplete
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isComplete ? (
                <Check className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
              ) : (
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? 'bg-white' : stats.answered > 0 ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                />
              )}

              <span>{sec.label}</span>

              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  isActive
                    ? 'bg-blue-700/60 text-white'
                    : isComplete
                    ? 'bg-emerald-200/60 text-emerald-900'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {stats.answered}/{stats.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
