'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';

interface SkillsErrorStateProps {
  error?: string | null;
  onRetry: () => void;
}

export function SkillsErrorState({ error, onRetry }: SkillsErrorStateProps) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto my-6">
      <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-rose-900">
          Unable to load your skill profile.
        </h3>
        <p className="text-xs sm:text-sm text-rose-700">
          Your saved data is safe. A temporary connection or service error occurred.
        </p>
        {error && (
          <div className="text-[11px] text-rose-600 bg-rose-100/70 py-1 px-3 rounded-lg font-mono mt-2 inline-block">
            {error}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
