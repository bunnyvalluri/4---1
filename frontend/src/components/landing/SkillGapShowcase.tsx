'use client';

import React from 'react';
import Link from 'next/link';
import { Target, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const skillGaps = [
  {
    skill: 'Python & Algorithms',
    currentLevel: 'Advanced (Level 4/5)',
    requiredLevel: 'Advanced (Level 4/5)',
    currentPct: 85,
    requiredPct: 85,
    status: 'Satisfied',
    priority: 'Low (Maintain)',
    priorityColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barColor: 'bg-emerald-500',
    note: 'Meets production engineering standards for data structures and REST services.',
  },
  {
    skill: 'System Design & Scalability',
    currentLevel: 'Intermediate (Level 2/5)',
    requiredLevel: 'Advanced (Level 4/5)',
    currentPct: 45,
    requiredPct: 85,
    status: 'Critical Gap',
    priority: 'High Priority',
    priorityColor: 'bg-amber-50 text-amber-700 border-amber-200',
    barColor: 'bg-amber-500',
    note: 'Requires mastery of caching, rate limiting, message brokers, and horizontal scaling.',
  },
  {
    skill: 'Cloud Fundamentals & AWS',
    currentLevel: 'Beginner (Level 1/5)',
    requiredLevel: 'Intermediate (Level 3/5)',
    currentPct: 25,
    requiredPct: 65,
    status: 'Moderate Gap',
    priority: 'Medium Priority',
    priorityColor: 'bg-blue-50 text-blue-700 border-blue-200',
    barColor: 'bg-blue-600',
    note: 'Focus on containerization (Docker) and serverless deployment pipelines.',
  },
  {
    skill: 'SQL & Database Indexing',
    currentLevel: 'Intermediate (Level 3/5)',
    requiredLevel: 'Advanced (Level 4/5)',
    currentPct: 65,
    requiredPct: 85,
    status: 'Minor Gap',
    priority: 'Medium Priority',
    priorityColor: 'bg-blue-50 text-blue-700 border-blue-200',
    barColor: 'bg-indigo-600',
    note: 'Query optimization, connection pooling, and relational schema normalization.',
  },
];

export function SkillGapShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Precision Skill Telemetry
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Know Exactly What You Need to Learn
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            No more wondering what recruiters look for. Benchmark your existing proficiencies directly against real industry expectations to isolate your exact skill gaps.
          </p>
        </div>

        {/* Skill Gap Cards / Breakdown */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Benchmark Analysis
                </span>
                <div className="text-base font-bold text-slate-900">
                  Target Role: Full-Stack Software Engineer
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Industry Benchmark: <span className="font-semibold text-slate-800">Mid-Level Tier (L4)</span>
              </div>
            </div>

            {/* List of Skills with Level Bars */}
            <div className="space-y-6">
              {skillGaps.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3 hover:border-slate-200 transition-colors"
                >
                  {/* Top row: Skill name + badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.skill}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.note}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${item.priorityColor}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  {/* Level comparison stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Level</span>
                      <span className="font-semibold text-slate-800">{item.currentLevel}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Required Level</span>
                      <span className="font-semibold text-slate-800">{item.requiredLevel}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Skill Gap</span>
                      <span className={`font-semibold ${item.status === 'Satisfied' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Roadmap Status</span>
                      <span className="font-semibold text-blue-600">Curriculum Synced</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Proficiency Progress</span>
                      <span>{item.currentPct}% Current • Benchmark {item.requiredPct}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      {/* Required benchmark indicator marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                        style={{ left: `${item.requiredPct}%` }}
                        title="Required Level Marker"
                      />
                      {/* Current progress fill */}
                      <div
                        className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                        style={{ width: `${item.currentPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Link */}
            <div className="pt-2 text-center">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>Run a Full Skill-Gap Telemetry Check</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
