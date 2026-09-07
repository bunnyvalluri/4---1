'use client';

import React from 'react';
import { UserCheck, Sparkles, Target, TrendingUp } from 'lucide-react';

const trustItems = [
  {
    icon: UserCheck,
    title: 'Personalized Guidance',
    description: 'Based on your unique profile',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Data-driven career recommendations',
  },
  {
    icon: Target,
    title: 'Skill-Gap Analysis',
    description: 'Know exactly what to learn next',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Turn recommendations into action',
  },
];

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-slate-50/70 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3.5 p-2 rounded-xl"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-2xs text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 truncate leading-relaxed">
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
