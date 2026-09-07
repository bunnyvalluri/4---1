'use client';

import React from 'react';
import {
  CheckCircle2,
  FileCheck,
  Map,
  Award,
  Sparkles,
  Clock,
  History,
} from 'lucide-react';
import { ActivityItem } from '@/lib/hooks/useDashboardRealtime';

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'Completed Python Skill Assessment',
      category: 'ASSESSMENT',
      relative_time: '2 minutes ago',
      icon: 'CheckCircle2',
    },
    {
      id: '2',
      title: 'Resume Analysis Completed (ATS Score: 88/100)',
      category: 'RESUME',
      relative_time: '18 minutes ago',
      icon: 'FileCheck',
    },
    {
      id: '3',
      title: 'Completed Roadmap Milestone: JavaScript & TypeScript',
      category: 'ROADMAP',
      relative_time: 'Yesterday',
      icon: 'Map',
    },
    {
      id: '4',
      title: 'Updated Technical Skills Matrix (Docker & FastAPI)',
      category: 'SKILLS',
      relative_time: 'Yesterday',
      icon: 'Award',
    },
    {
      id: '5',
      title: 'Career Recommendations Refreshed (Full Stack Developer 92%)',
      category: 'RECOMMENDATION',
      relative_time: '2 days ago',
      icon: 'Sparkles',
    },
  ];

  const items = activities.length > 0 ? activities : defaultActivities;

  const renderIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'ASSESSMENT':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'RESUME':
        return <FileCheck className="h-4 w-4 text-violet-600" />;
      case 'ROADMAP':
        return <Map className="h-4 w-4 text-indigo-600" />;
      case 'SKILLS':
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500" />
          <span>Recent Activity</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-400">Live Telemetry Feed</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((act) => (
          <div key={act.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs">
                {renderIcon(act.category)}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">
                {act.title}
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-medium shrink-0">
              {act.relative_time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
