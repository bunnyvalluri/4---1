'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Map, Check } from 'lucide-react';
import { RoadmapData } from '@/lib/hooks/useDashboardRealtime';

interface RoadmapProgressProps {
  roadmap?: RoadmapData | null;
  onToggleTask: (itemId: string, taskId: string, currentDone: boolean) => Promise<void>;
}

export function RoadmapProgress({ roadmap, onToggleTask }: RoadmapProgressProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const hasActiveRoadmap = roadmap && Array.isArray(roadmap.items) && roadmap.items.length > 0;
  const data = roadmap || {
    career: 'Not Selected',
    progress: 0,
    current_stage: 'Not Started',
    duration_months: 0,
    items: [],
  };

  const handleToggle = async (itemId: string, taskId: string, currentDone: boolean) => {
    setUpdatingTaskId(taskId);
    try {
      await onToggleTask(itemId, taskId, currentDone);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[10px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-200/70">
            <Map className="h-3 w-3 shrink-0" />
            <span>Target: {data.career}</span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
            Your Career Roadmap
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Stage: <span className="font-bold text-slate-700">{data.current_stage}</span>
          </p>
        </div>

        {hasActiveRoadmap && (
          <Link
            href="/roadmap"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 self-start sm:self-auto min-h-[44px] flex items-center"
          >
            View Full Roadmap →
          </Link>
        )}
      </div>

      {hasActiveRoadmap ? (
        <>
          {/* Progress Bar & Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Roadmap Progress</span>
              <span className="font-black text-blue-600 text-sm">{data.progress}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>

          {/* Interactive Milestone Timeline List */}
          <div className="space-y-3 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Milestones Timeline (Tap to toggle)
            </span>

            {data.items.slice(0, 4).map((item, idx) => {
              const firstTask = item.tasks?.[0];
              const isDone = item.is_completed || firstTask?.done;
              const isCurrent = !isDone && (idx === 0 || data.items[idx - 1]?.is_completed);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 ${
                    isDone
                      ? 'bg-slate-50/50 border-slate-200/60'
                      : isCurrent
                      ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Milestone Icon */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <span>M{item.month}</span>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold break-words ${
                            isDone ? 'text-slate-600 line-through' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            Active Stage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {firstTask?.title || item.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Complete Action */}
                  <button
                    type="button"
                    disabled={updatingTaskId === firstTask?.id}
                    onClick={() => {
                      if (firstTask) {
                        handleToggle(item.id, firstTask.id, !!firstTask.done);
                      }
                    }}
                    className={`w-full sm:w-auto shrink-0 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center active:scale-[0.98] ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xs'
                    }`}
                  >
                    {updatingTaskId === firstTask?.id
                      ? 'Saving...'
                      : isDone
                      ? 'Completed ✓'
                      : 'Mark Done'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-8 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto border border-indigo-200/80">
            <Map className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">No Active Career Roadmap</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select your target career or explore career paths to generate an AI-sequenced month-by-month learning curriculum.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/roadmap"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[38px]"
            >
              Generate Career Roadmap
            </Link>
            <Link
              href="/careers"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors min-h-[38px]"
            >
              Explore Careers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
