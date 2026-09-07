'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  ChevronRight,
  Code2,
  Check,
} from 'lucide-react';

const evaluationFactors = [
  { label: 'Technical Skills', desc: 'Verified proficiencies matched against core and elective role benchmarks.' },
  { label: 'Educational Background', desc: 'Degree alignment and cross-domain merit (e.g. HCI for UI/UX, Stats for ML).' },
  { label: 'Personal Interests', desc: 'Domain passions, preferred work environments, and long-term ambition.' },
  { label: 'Assessment Performance', desc: 'Cognitive aptitude metrics, analytical speed, and problem-solving depth.' },
  { label: 'Practical Experience', desc: 'Prior project history, internships, and demonstrable execution capability.' },
  { label: 'Career Preferences', desc: 'Salary targets, desired industry velocity, and specialization paths.' },
];

export function RecommendationShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Explanation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Data-Driven Intelligence
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Make Smarter Career Decisions with AI
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Unlike simplistic quiz-based tools, CareerAI utilizes a multi-attribute utility algorithm that balances 6 distinct dimensions to calculate your genuine fit.
            </p>

            {/* Evaluation Factors List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {evaluationFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">{factor.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug pl-6">
                    {factor.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <Link
                href="/recommendations"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>View Sample Career Matches</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic Career Match UI */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/40">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Your Career Match
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    Software Engineer
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">High Market Demand • Engineering Tier 1</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-extrabold">
                    <TrendingUp className="h-4 w-4" />
                    <span>92% Fit</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 font-medium">Confidence: High</span>
                </div>
              </div>

              {/* Strong Matches List */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Strong Matches</span>
                    <span className="text-emerald-600 text-[11px] font-semibold">Exceeds Benchmark</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Programming', score: '96%', desc: 'Demonstrated proficiency in Python, React, and SQL' },
                      { name: 'Problem Solving', score: '92%', desc: 'High diagnostic aptitude in algorithmic logic' },
                      { name: 'Technical Interest', score: '89%', desc: 'Strong alignment with software design & systems' },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                          <div>
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <span className="hidden sm:inline text-slate-500 text-[11px] ml-2">({item.desc})</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-emerald-700 shrink-0">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Development Areas */}
                <div className="pt-1">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Development Areas</span>
                    <span className="text-amber-700 text-[11px] font-semibold">Priority Focus</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'System Design', gap: 'Moderate Gap', plan: 'Included in Month 4 of roadmap' },
                      { name: 'Cloud Infrastructure', gap: 'Foundational Gap', plan: 'AWS & Docker modules pending' },
                      { name: 'Automated Testing', gap: 'Elective Gap', plan: 'Unit & integration test suites' },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/70 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <span className="hidden sm:inline text-slate-400 text-[11px]">• {item.plan}</span>
                        </div>
                        <span className="font-medium text-amber-700 text-[11px] shrink-0">{item.gap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Action Callout */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                  <div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Recommended Action
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      Build 2 production-level projects
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Validates distributed systems and cloud deployment proficiencies.
                    </div>
                  </div>
                  <Link
                    href="/projects"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    <span>View Projects</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
