'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';

const sampleExperiences = [
  {
    badge: 'Sample Experience',
    persona: 'Frontend to Full-Stack Transition',
    scenario: 'Candidate with 1 year React experience aiming for Full-Stack Software Engineer',
    quote:
      'The multi-factor analysis clarified that my frontend foundation was solid (95%), but lack of relational database schema design was pulling down my compatibility score. The tailored 6-month roadmap provided a direct path through PostgreSQL and Docker.',
    outcome: 'Bridge 2 critical skill gaps in 8 weeks of focused study.',
    tags: ['Skill-Gap Telemetry', 'Full-Stack Roadmap'],
  },
  {
    badge: 'Sample Experience',
    persona: 'Design to Tech Career Alignment',
    scenario: 'HCI / Design graduate exploring technical product roles',
    quote:
      'Most platforms assume you need a pure computer science degree. CareerAI’s cross-domain academic evaluation recognized my design background and recommended UI/UX Product Design with a 92% fit, prioritizing prototyping and user metrics.',
    outcome: 'Identified high-affinity pathway matching academic strengths.',
    tags: ['Academic Cross-Alignment', 'Product Design'],
  },
  {
    badge: 'Sample Experience',
    persona: 'ATS Resume Optimization',
    scenario: 'Recent graduate preparing for competitive entry-level applications',
    quote:
      'The resume analyzer identified 3 passive bullet points lacking quantifiable results and highlighted missing cloud keywords. Rewriting them with metrics improved response rates in simulated ATS tests.',
    outcome: 'Transformed passive resume statements into metric-backed impact.',
    tags: ['Resume ATS Scanner', 'Keyword Alignment'],
  },
];

export function SampleExperiences() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Workflow Case Studies
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            How Candidates Navigate CareerAI
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Representative sample workflows illustrating how different candidate backgrounds leverage our diagnostic pipeline, skill gap analysis, and tailored roadmaps.
          </p>
        </div>

        {/* Sample Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {sampleExperiences.map((exp, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/40 p-6 sm:p-7 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all shadow-2xs"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                    {exp.badge}
                  </span>
                  <UserCheck className="h-4 w-4 text-slate-400" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{exp.persona}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{exp.scenario}</div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic font-normal">
                  &ldquo;{exp.quote}&rdquo;
                </p>
              </div>

              {/* Bottom Outcome & Tags */}
              <div className="pt-4 border-t border-slate-200/80 space-y-3">
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{exp.outcome}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exp.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
