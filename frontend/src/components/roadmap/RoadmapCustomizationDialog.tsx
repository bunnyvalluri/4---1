'use client';

import React, { useState } from 'react';
import { X, Clock, Zap, Calendar, Check } from 'lucide-react';
import { LearningPace } from '@/lib/types/roadmap';

interface RoadmapCustomizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentHours: number;
  currentPace: LearningPace;
  onSave: (hours: number, pace: LearningPace) => void;
}

export function RoadmapCustomizationDialog({
  isOpen,
  onClose,
  currentHours,
  currentPace,
  onSave,
}: RoadmapCustomizationDialogProps) {
  const [hours, setHours] = useState(currentHours || 10);
  const [pace, setPace] = useState<LearningPace>(currentPace || 'balanced');

  if (!isOpen) return null;

  const paceOptions: Array<{ id: LearningPace; label: string; desc: string; defaultHours: number }> = [
    {
      id: 'fast_track',
      label: 'Fast Track (Intensive)',
      desc: 'Accelerate milestone completion for imminent hiring deadlines.',
      defaultHours: 20,
    },
    {
      id: 'balanced',
      label: 'Balanced (Recommended)',
      desc: 'Sustainable pace balancing learning depth with work/studies.',
      defaultHours: 10,
    },
    {
      id: 'flexible',
      label: 'Flexible (Part-Time)',
      desc: 'Extended timeline focusing on thorough mastery at your own pace.',
      defaultHours: 5,
    },
  ];

  const handlePaceSelect = (selectedPace: LearningPace, defaultHours: number) => {
    setPace(selectedPace);
    setHours(defaultHours);
  };

  const handleSave = () => {
    onSave(hours, pace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Customize Roadmap Pace
            </h3>
            <p className="text-xs text-slate-500">
              Recalculate your estimated completion timeline and weekly commitment.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pace Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400">
            Learning Cadence
          </label>
          <div className="space-y-2">
            {paceOptions.map((opt) => {
              const isSelected = pace === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handlePaceSelect(opt.id, opt.defaultHours)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-extrabold text-slate-900">
                      {opt.label}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hours Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Hours Per Week
            </span>
            <span className="text-blue-600 font-extrabold text-sm">{hours} hours / week</span>
          </div>

          <input
            type="range"
            min={4}
            max={40}
            step={2}
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>4 hrs (Casual)</span>
            <span>10 hrs (Standard)</span>
            <span>20+ hrs (Bootcamp)</span>
          </div>
        </div>

        {/* Actions */}
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
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700"
          >
            Apply & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}
