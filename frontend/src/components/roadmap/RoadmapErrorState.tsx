'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface RoadmapErrorStateProps {
  onRetry: () => void;
}

export function RoadmapErrorState({ onRetry }: RoadmapErrorStateProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xs space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900">
            Unable to Load Roadmap
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your saved progress is safe. We experienced a temporary network latency syncing with the database.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
