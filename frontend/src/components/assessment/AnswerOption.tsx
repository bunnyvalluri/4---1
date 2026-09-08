'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AnswerOptionProps {
  index: number;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function AnswerOption({
  index,
  text,
  isSelected,
  onSelect,
  disabled = false,
}: AnswerOptionProps) {
  const letter = String.fromCharCode(65 + index); // A, B, C, D

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={disabled}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`w-full p-4 sm:p-4.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between min-h-[52px] group focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isSelected
          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
          }`}
        >
          {letter}
        </span>
        <span className="leading-relaxed break-words">{text}</span>
      </div>

      <div className="shrink-0 ml-2">
        {isSelected ? (
          <CheckCircle2 className="h-5 w-5 text-blue-600 animate-in zoom-in-50 duration-200" />
        ) : (
          <div className="h-5 w-5 rounded-full border border-slate-300 group-hover:border-slate-400" />
        )}
      </div>
    </button>
  );
}
