'use client';

import React from 'react';
import { Check, Lock, Play, Circle } from 'lucide-react';
import { RoadmapPhaseData } from '@/lib/types/roadmap';

interface RoadmapTimelineProps {
  phases: RoadmapPhaseData[];
  activePhaseId: string;
  onSelectPhase: (phaseId: string) => void;
}

export function RoadmapTimeline({ phases, activePhaseId, onSelectPhase }: RoadmapTimelineProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Curriculum Phase Timeline
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          6 Progressive Milestones
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {phases.map((phase) => {
          const isActive = phase.id === activePhaseId;
          const isDone = phase.progress_percent >= 100;
          const isLocked = phase.status === 'LOCKED';
          const isStarted = phase.progress_percent > 0 && !isDone;

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => onSelectPhase(phase.id)}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] focus:outline-none focus:ring-2 ${
                isActive
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                  : isDone
                  ? 'border-emerald-200/90 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-50'
                  : isLocked
                  ? 'border-slate-200/60 bg-slate-50/50 text-slate-400 cursor-pointer hover:bg-slate-100/70'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  Month {phase.month}
                </span>

                {isDone ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" />
                  </span>
                ) : isLocked ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                    <Lock className="h-2.5 w-2.5" />
                  </span>
                ) : isStarted ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 animate-pulse">
                    <Play className="h-2.5 w-2.5 fill-blue-600" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Circle className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>

              <div className="space-y-1 my-1">
                <div className="text-xs font-bold truncate">
                  {phase.title.replace(/Phase \d+:\s*/i, '')}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {phase.subtitle}
                </div>
              </div>

              {/* Mini Progress Bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone ? 'bg-emerald-500' : isActive ? 'bg-blue-600' : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.min(100, phase.progress_percent)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
