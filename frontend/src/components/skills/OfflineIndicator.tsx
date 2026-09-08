'use client';

import React from 'react';
import { WifiOff, Clock } from 'lucide-react';

interface OfflineIndicatorProps {
  lastSyncText?: string;
}

export function OfflineIndicator({ lastSyncText = 'just now' }: OfflineIndicatorProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs flex items-center justify-between gap-3 text-amber-800 shadow-2xs">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
        <div>
          <span className="font-extrabold">Offline Mode: </span>
          <span>Showing cached safe telemetry. Changes will synchronize automatically when connectivity returns.</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold shrink-0">
        <Clock className="h-3.5 w-3.5" />
        <span>Last synchronized: {lastSyncText}</span>
      </div>
    </div>
  );
}
