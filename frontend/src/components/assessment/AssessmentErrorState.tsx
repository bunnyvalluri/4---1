'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AssessmentErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function AssessmentErrorState({
  message = 'An unexpected error occurred while loading the assessment.',
  onRetry,
}: AssessmentErrorStateProps) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertCircle className="h-7 w-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-black text-slate-900">Diagnostic Service Notice</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">{message}</p>
        <p className="text-[11px] text-slate-400">Your previously saved responses remain securely cached.</p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Retry Connection</span>
      </button>
    </div>
  );
}
