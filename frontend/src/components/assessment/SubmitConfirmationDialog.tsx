'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Flag, HelpCircle, X } from 'lucide-react';

interface SubmitConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;
  submitting?: boolean;
}

export function SubmitConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  unansweredCount,
  flaggedCount,
  submitting = false,
}: SubmitConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Submit Assessment?</h3>
              <p className="text-xs text-slate-500">Answers cannot be modified once submitted.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Telemetry summary */}
        <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
          <div className="space-y-0.5">
            <div className="text-lg font-black text-emerald-600">{answeredCount}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Answered</div>
          </div>

          <div className="space-y-0.5 border-x border-slate-200">
            <div className={`text-lg font-black ${unansweredCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {unansweredCount}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Unanswered</div>
          </div>

          <div className="space-y-0.5">
            <div className={`text-lg font-black ${flaggedCount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
              {flaggedCount}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Flagged</div>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              You still have <strong>{unansweredCount} unanswered questions</strong>. Unanswered questions will count as 0 towards your diagnostic score.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold shadow-sm shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all hover:-translate-y-0.5"
          >
            <span>{submitting ? 'Submitting...' : 'Confirm & Submit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
