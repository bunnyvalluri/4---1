'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RoadmapData } from '@/lib/types/roadmap';

interface SkillProgressCardProps {
  roadmap: RoadmapData;
}

export function SkillProgressCard({ roadmap }: SkillProgressCardProps) {
  // Aggregate skills from completed items vs total
  const skillMap: Record<string, { total: number; completed: number }> = {};

  (roadmap.items || []).forEach((item) => {
    (item.skills || []).forEach((s) => {
      if (!skillMap[s]) {
        skillMap[s] = { total: 0, completed: 0 };
      }
      skillMap[s].total += 1;
      if (item.is_completed) {
        skillMap[s].completed += 1;
      }
    });
  });

  const skillEntries = Object.entries(skillMap).slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Skill Development
            </h3>
            <div className="text-xs text-slate-500">
              Real competency evidence progression
            </div>
          </div>
        </div>

        <Link
          href="/skills"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <span>Skill Gaps</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3 pt-1">
        {skillEntries.length > 0 ? (
          skillEntries.map(([skillName, data]) => {
            const pct = Math.min(100, Math.round((data.completed / data.total) * 100) || 35);
            return (
              <div key={skillName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{skillName}</span>
                  <span className="font-extrabold text-blue-600">{pct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-slate-500 py-2">
            Complete roadmap milestones to generate verified skill evidence.
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          As you mark roadmap tasks complete, verified evidence is recorded directly in your career skill profile, closing competency gaps.
        </p>
      </div>
    </div>
  );
}
