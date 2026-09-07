'use client';

import React from 'react';
import Link from 'next/link';
import {
  UserCircle2,
  BrainCircuit,
  Sparkles,
  MapPin,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Build Your Profile',
    icon: UserCircle2,
    description:
      'Enter your academic background, current technical competencies, and role interests, or upload a resume to auto-populate your skills.',
    detail: 'Complete in under 3 minutes',
  },
  {
    step: '02',
    title: 'Take Career Assessments',
    icon: BrainCircuit,
    description:
      'Engage with adaptive psychometric and cognitive diagnostics that objectively measure problem solving, analytical thinking, and learning speed.',
    detail: 'Adaptive questions & aptitude scoring',
  },
  {
    step: '03',
    title: 'Get AI Career Recommendations',
    icon: Sparkles,
    description:
      'Our hybrid scoring engine cross-evaluates your profile against industry benchmarks to deliver explainable compatibility scores and confidence ratings.',
    detail: '7-factor utility breakdown',
  },
  {
    step: '04',
    title: 'Follow Your Personalized Roadmap',
    icon: MapPin,
    description:
      'Follow an actionable 6-month progression tailored to bridge your exact skill gaps through milestone tasks, recommended projects, and ATS optimization.',
    detail: 'Synchronized telemetry & project milestones',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Methodology & Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            How CareerAI Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            A simple 4-step pipeline designed to replace guesswork with personalized, data-backed career certainty.
          </p>
        </div>

        {/* 4-Step Journey Grid / Timeline */}
        <div className="relative">
          {/* Subtle connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 -translate-y-12 bg-slate-200 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div>
                    {/* Step Number & Icon Header */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-2xl font-extrabold text-slate-300 font-mono group-hover:text-blue-600 transition-colors">
                        {item.step}
                      </span>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal mb-5">
                      {item.description}
                    </p>
                  </div>

                  {/* Micro indicator */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{item.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA within How It Works */}
        <div className="mt-14 text-center">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
          >
            <span>Begin Step 1: Start Free Diagnostic</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
