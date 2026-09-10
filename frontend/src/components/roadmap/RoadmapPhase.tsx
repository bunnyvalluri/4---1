'use client';

import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';
import { RoadmapPhaseData, RoadmapItemData } from '@/lib/types/roadmap';
import { RoadmapItemCard } from './RoadmapItemCard';

interface RoadmapPhaseProps {
  phase: RoadmapPhaseData;
  items: RoadmapItemData[];
  allItems: RoadmapItemData[];
  onStart: (itemId: string) => void;
  onComplete: (itemId: string) => void;
  onSkip: (itemId: string) => void;
  onToggleTask: (itemId: string, taskId: string, currentDone: boolean) => void;
  onSaveNotes: (itemId: string, notes: string) => void;
  onCompleteResource: (itemId: string, resourceId: string) => void;
  onStartResource?: (itemId: string, resourceId: string) => void;
}

export function RoadmapPhase({
  phase,
  items,
  allItems,
  onStart,
  onComplete,
  onSkip,
  onToggleTask,
  onSaveNotes,
  onCompleteResource,
  onStartResource,
}: RoadmapPhaseProps) {
  const isPhaseComplete = phase.progress_percent >= 100;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Phase Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
              Curriculum Milestone {phase.month} of 6
            </span>
            {isPhaseComplete && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Phase Cleared
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {phase.title}: {phase.subtitle}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {phase.description}
          </p>
        </div>

        {/* Phase Progress Gauge */}
        <div className="shrink-0 text-left sm:text-right bg-slate-50 border border-slate-200 p-3.5 rounded-2xl min-w-[120px]">
          <div className="text-2xl font-black text-slate-900">
            {Math.round(phase.progress_percent)}%
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Phase Progress
          </div>
        </div>
      </div>

      {/* Target Technologies Covered */}
      {phase.target_skills && phase.target_skills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Core Technologies:
          </span>
          {phase.target_skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4 pt-2">
        {items.map((item) => (
          <RoadmapItemCard
            key={item.id}
            item={item}
            allItems={allItems}
            onStart={onStart}
            onComplete={onComplete}
            onSkip={onSkip}
            onToggleTask={onToggleTask}
            onSaveNotes={onSaveNotes}
            onCompleteResource={onCompleteResource}
            onStartResource={onStartResource}
          />
        ))}
      </div>
    </div>
  );
}
