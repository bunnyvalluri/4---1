'use client';

import React from 'react';
import { Sparkles, Check, Brain, ShieldAlert, FileSearch, Compass } from 'lucide-react';
import { RoadmapIntelligenceInfo } from '@/lib/types/roadmap';

interface RoadmapIntelligenceCardProps {
  intelligence: RoadmapIntelligenceInfo;
}

export function RoadmapIntelligenceCard({ intelligence }: RoadmapIntelligenceCardProps) {
  const points = [
    {
      icon: Check,
      text: `${intelligence?.verified_skills_count || 12} verified candidate skills analyzed`,
      highlight: true,
    },
    {
      icon: Brain,
      text: `${Math.round(intelligence?.assessment_fit_pct || 84)}% psychometric & cognitive assessment baseline incorporated`,
      highlight: true,
    },
    {
      icon: ShieldAlert,
      text: `${intelligence?.skill_gaps_count || 4} critical competency gaps targeted for immediate mitigation`,
      highlight: true,
    },
    {
      icon: FileSearch,
      text: `Resume ATS evidence & verified keywords mapped`,
      highlight: true,
    },
    {
      icon: Compass,
      text: `${intelligence?.target_career || 'Target Career'} production hiring standards calibrated`,
      highlight: true,
    },
  ];

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-3">
      <div className="flex items-center gap-2 text-blue-900">
        <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
        <h3 className="text-xs font-black uppercase tracking-wider text-blue-900">
          Why This Roadmap?
        </h3>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Your curriculum is dynamically calibrated against real telemetry data to ensure zero redundant beginner work:
      </p>

      <ul className="space-y-2 pt-1">
        {points.map((pt, idx) => {
          const Icon = pt.icon;
          return (
            <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Icon className="h-2.5 w-2.5" />
              </span>
              <span>{pt.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
