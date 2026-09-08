'use client';

import React from 'react';
import { Flame, Clock, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { RoadmapItemData } from '@/lib/types/roadmap';

interface TodaysFocusProps {
  items: RoadmapItemData[];
  onSelectTask: (itemId: string) => void;
}

export function TodaysFocus({ items, onSelectTask }: TodaysFocusProps) {
  // Pick active or first unlocked not-started items (up to 3)
  const activeOrUnlocked = items.filter((i) => !i.is_completed && i.status !== 'LOCKED' && i.status !== 'SKIPPED').slice(0, 3);

  if (activeOrUnlocked.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Flame className="h-4 w-4 fill-white" />
          </span>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
              Today's Focus
            </h3>
            <div className="text-xs text-amber-700/80">
              High-impact actionable tasks ready for execution
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
          {activeOrUnlocked.length} Active Targets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {activeOrUnlocked.map((it, idx) => {
          const estMin = it.estimated_hours <= 2 ? Math.round(it.estimated_hours * 60) : 45 + idx * 15;
          const isOngoing = it.status === 'IN_PROGRESS';

          return (
            <div
              key={it.id}
              onClick={() => onSelectTask(it.id)}
              className="group cursor-pointer rounded-xl border border-slate-200/90 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-blue-600 uppercase tracking-wider">
                    Task #{idx + 1} • Month {it.month}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{estMin} min</span>
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {it.title}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {it.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isOngoing ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isOngoing ? 'In Progress' : 'Ready to Start'}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>{isOngoing ? 'Continue' : 'Start'}</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
