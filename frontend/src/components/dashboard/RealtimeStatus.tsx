'use client';

import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface RealtimeStatusProps {
  status: 'Live' | 'Syncing...' | 'Offline' | 'Cached';
  lastUpdatedText?: string;
  onRefresh?: () => void;
}

export function RealtimeStatus({
  status,
  lastUpdatedText = 'just now',
  onRefresh,
}: RealtimeStatusProps) {
  const isLive = status === 'Live';
  const isSyncing = status === 'Syncing...';
  const isOffline = status === 'Offline' || status === 'Cached';

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs select-none">
      {/* Live status dot */}
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive
              ? 'bg-emerald-500'
              : isSyncing
              ? 'bg-amber-500 animate-pulse'
              : 'bg-slate-400'
          }`}
        />
      </span>

      <span className="font-bold text-slate-800">{status}</span>

      <span className="text-slate-300">•</span>

      <span className="text-slate-500 hidden sm:inline">
        Updated {lastUpdatedText}
      </span>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="ml-1 p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors focus-visible:ring-1 focus-visible:ring-blue-600 outline-none cursor-pointer"
          title="Refresh real-time telemetry"
          aria-label="Refresh telemetry data"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      )}
    </div>
  );
}
