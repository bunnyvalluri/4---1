'use client';

import React from 'react';
import { CloudOff } from 'lucide-react';

interface OfflineAssessmentBannerProps {
  isOnline: boolean;
}

export function OfflineAssessmentBanner({ isOnline }: OfflineAssessmentBannerProps) {
  if (isOnline) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2.5">
        <CloudOff className="h-4 w-4 text-amber-600 shrink-0" />
        <span>
          <strong>Offline Mode:</strong> Internet connection lost. Your answers are saved locally in your browser and will automatically sync once your connection returns.
        </span>
      </div>
    </div>
  );
}
