'use client';

import React from 'react';
import {
  Award,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Target,
} from 'lucide-react';
import { SkillOverviewMetrics } from '@/lib/hooks/useSkillIntelligence';

interface SkillOverviewMetricsProps {
  metrics?: SkillOverviewMetrics;
  targetCareerTitle?: string;
}

export function SkillOverviewMetricsGrid({
  metrics,
  targetCareerTitle = 'Full Stack Developer',
}: SkillOverviewMetricsProps) {
  const m = metrics || {
    total_skills: 0,
    verified_skills: 0,
    strong_skills: 0,
    skill_readiness_pct: 0,
    critical_gaps_count: 0,
    learning_count: 0,
    career_alignment_pct: 0,
  };

  const cards = [
    {
      title: 'TOTAL SKILLS',
      value: m.total_skills,
      subtitle: `Verified: ${m.verified_skills}`,
      icon: Award,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      title: 'STRONG SKILLS',
      value: m.strong_skills,
      subtitle: 'Advanced proficiency',
      icon: ShieldCheck,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'SKILL READINESS',
      value: `${m.skill_readiness_pct}%`,
      subtitle: 'For current career target',
      icon: Target,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'CRITICAL GAPS',
      value: m.critical_gaps_count,
      subtitle: 'High-priority skills',
      icon: AlertTriangle,
      badgeColor: m.critical_gaps_count > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200',
      iconColor: m.critical_gaps_count > 0 ? 'text-rose-600' : 'text-slate-500',
    },
    {
      title: 'LEARNING',
      value: m.learning_count,
      subtitle: 'Skills currently in progress',
      icon: BookOpen,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600',
    },
    {
      title: 'CAREER ALIGNMENT',
      value: `${m.career_alignment_pct}%`,
      subtitle: `Against ${targetCareerTitle}`,
      icon: TrendingUp,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-xl border ${card.badgeColor}`}>
                <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
