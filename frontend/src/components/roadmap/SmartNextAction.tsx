'use client';

import React from 'react';
import { Zap, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { NextBestActionData } from '@/lib/types/roadmap';

interface SmartNextActionProps {
  action: NextBestActionData | null | undefined;
  onExecute: (itemId?: string | null) => void;
}

export function SmartNextAction({ action, onExecute }: SmartNextActionProps) {
  if (!action) return null;

  return (
    <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Zap className="h-4 w-4 fill-white" />
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
              Smart Recommended Action
            </span>
            <div className="text-xs text-slate-500">
              Optimized for maximum career readiness acceleration
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>{action.estimated_minutes || 45} min</span>
          </span>

          <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-700">
            {action.priority || 'HIGH'} PRIORITY
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
          {action.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-bold">Why: </strong>
          {action.reason}
        </p>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={() => onExecute(action.item_id)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>{action.action_label || 'Start Task →'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
