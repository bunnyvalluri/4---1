'use client';

import React from 'react';
import { Check, Loader2, CloudOff, AlertCircle, RefreshCw } from 'lucide-react';
import { SaveState } from '@/lib/hooks/useAssessment';

interface SaveStatusProps {
  status: SaveState;
  lastSaved?: Date | null;
}

export function SaveStatus({ status, lastSaved }: SaveStatusProps) {
  switch (status) {
    case 'saving':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
          <span>Saving...</span>
        </span>
      );
    case 'syncing':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
          <span>Syncing queue...</span>
        </span>
      );
    case 'offline':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <CloudOff className="h-3 w-3" />
          <span>Offline — saved locally</span>
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Sync failed • Retrying</span>
        </span>
      );
    case 'saved':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span>Saved just now</span>
        </span>
      );
    default:
      return null;
  }
}
