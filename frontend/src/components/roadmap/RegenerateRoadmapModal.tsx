'use client';

import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

interface RegenerateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: number;
  careers: Array<{ id: string; title: string }>;
  currentCareerId: string;
  onConfirm: (reason: string, careerId?: string) => void;
}

export function RegenerateRoadmapModal({
  isOpen,
  onClose,
  currentVersion,
  careers,
  currentCareerId,
  onConfirm,
}: RegenerateRoadmapModalProps) {
  const [selectedCareerId, setSelectedCareerId] = useState(currentCareerId);
  const [reason, setReason] = useState('Recalibrate roadmap with my latest assessment and skills');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason, selectedCareerId !== currentCareerId ? selectedCareerId : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <RefreshCw className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Regenerate Roadmap (v{currentVersion + 1})
              </h3>
              <p className="text-xs text-slate-500">
                Create a fresh version recalibrated to your latest telemetry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Curriculum Versioning Policy</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Your current roadmap (v{currentVersion}) will be safely archived into history. A brand new Version {currentVersion + 1} curriculum will be synthesized incorporating:
          </p>
          <ul className="list-disc list-inside text-[11px] space-y-1 text-amber-800 pl-1 font-medium">
            <li>Newly verified skills and completed competencies</li>
            <li>Latest diagnostic assessment score and cognitive benchmarks</li>
            <li>Updated resume keywords and ATS findings</li>
            <li>Highest-priority unresolved skill gaps</li>
          </ul>
        </div>

        {/* Optional Career Switch */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400">
            Target Career Path
          </label>
          <select
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400">
            Regeneration Reason (Audit Trail)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Completed assessment, pivoting target tech stack..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700"
          >
            Generate Version {currentVersion + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
