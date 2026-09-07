'use client';

import React from 'react';
import { Compass, Sparkles, Map, FileCheck } from 'lucide-react';

const capabilities = [
  {
    icon: Compass,
    metric: '20+',
    label: 'Calibrated Career Paths',
    description: 'Benchmarked against real industry role profiles and skill specifications.',
  },
  {
    icon: Sparkles,
    metric: '7-Factor',
    label: 'Multi-Criteria Scoring',
    description: 'Skills, education, aptitude, experience, and interests evaluated mathematically.',
  },
  {
    icon: Map,
    metric: '6-Month',
    label: 'Personalized Roadmaps',
    description: 'Actionable month-by-month curricula structured around your verified gaps.',
  },
  {
    icon: FileCheck,
    metric: 'ATS-Level',
    label: 'Resume Analysis',
    description: 'Keyword extraction, format validation, and quantified impact suggestions.',
  },
];

export function CapabilityMetrics() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Capability Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-slate-50/40 p-6 sm:p-7 space-y-3 shadow-2xs hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {item.metric}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-sm font-bold text-slate-900">
                    {item.label}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
