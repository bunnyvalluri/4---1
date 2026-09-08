'use client';

import React from 'react';
import { History, CheckCircle2, Play, Sparkles, FastForward } from 'lucide-react';
import { RoadmapActivityItem } from '@/lib/types/roadmap';

interface RoadmapActivityTimelineProps {
  activities: RoadmapActivityItem[];
}

export function RoadmapActivityTimeline({ activities }: RoadmapActivityTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case 'STARTED':
        return <Play className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />;
      case 'SKIPPED':
        return <FastForward className="h-3.5 w-3.5 text-slate-400" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Roadmap Activity
            </h3>
            <div className="text-xs text-slate-500">
              Auditable milestone progress log
            </div>
          </div>
        </div>

        <span className="text-[11px] font-bold text-slate-400">
          Live Feed
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {activities && activities.length > 0 ? (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                {getActionIcon(act.action)}
              </span>

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-bold text-slate-800 line-clamp-2">
                  {act.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-500 uppercase">
                    {act.category}
                  </span>
                  <span>•</span>
                  <span>{act.relative_time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">
            No milestone activity recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
