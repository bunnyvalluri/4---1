'use client';

import React from 'react';
import Link from 'next/link';
import { FolderGit2, ArrowRight, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { RoadmapItemData } from '@/lib/types/roadmap';

interface ProjectMilestonesCardProps {
  careerTitle: string;
  items: RoadmapItemData[];
}

export function ProjectMilestonesCard({ careerTitle, items }: ProjectMilestonesCardProps) {
  // Find project items in roadmap (usually phase 5)
  const projectItems = items.filter((i) => i.item_type === 'project' || i.phase_id === 'phase_5');

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Portfolio Capstones
            </h3>
            <div className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
              Production Deliverables
            </div>
          </div>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <span>Projects</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 space-y-2">
        <div className="text-xs font-bold text-purple-900">
          Capstone Showcase for {careerTitle}
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Deliver an end-to-end production application to provide recruiters with verifiable proof of competence.
        </p>
      </div>

      <div className="space-y-2 pt-1">
        {projectItems.map((pi) => (
          <div
            key={pi.id}
            className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {pi.is_completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-400 shrink-0" />
              )}
              <span className={`font-semibold truncate ${pi.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {pi.title}
              </span>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                pi.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pi.is_completed ? 'Cleared' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
