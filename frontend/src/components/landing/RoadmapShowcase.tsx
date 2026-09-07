'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Map,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  CircleDot,
} from 'lucide-react';

const roadmapMonths = [
  {
    month: 'Month 1',
    title: 'Programming Foundations',
    status: 'Completed',
    duration: '4 Weeks',
    topics: ['Data Structures & Complexity', 'Object-Oriented Design', 'Clean Code Principles'],
    deliverable: 'Algorithmic Problem-Solving Suite (50+ LeetCode-style challenges solved)',
    state: 'done',
  },
  {
    month: 'Month 2',
    title: 'Backend Development',
    status: 'In Progress',
    duration: '4 Weeks',
    topics: ['RESTful API Design', 'Middleware Architecture', 'Authentication & JWT/OAuth'],
    deliverable: 'Production Authentication & User Management API Service',
    state: 'active',
  },
  {
    month: 'Month 3',
    title: 'Databases & ORM',
    status: 'Upcoming',
    duration: '4 Weeks',
    topics: ['PostgreSQL Relational Schema', 'Indexing & Query Plans', 'Prisma ORM Migrations'],
    deliverable: 'Scalable E-Commerce Data Store with Normalized Relations',
    state: 'pending',
  },
  {
    month: 'Month 4',
    title: 'Cloud Fundamentals',
    status: 'Upcoming',
    duration: '4 Weeks',
    topics: ['Docker Containerization', 'AWS S3 & EC2 Deployment', 'GitHub Actions CI/CD'],
    deliverable: 'Automated Zero-Downtime Deployment Pipeline',
    state: 'pending',
  },
  {
    month: 'Month 5',
    title: 'Production Project',
    status: 'Upcoming',
    duration: '4 Weeks',
    topics: ['Full-Stack Integration', 'WebSockets & Caching (Redis)', 'Load Testing & Monitoring'],
    deliverable: 'Live Distributed SaaS Application with Monitoring Dashboard',
    state: 'pending',
  },
  {
    month: 'Month 6',
    title: 'Interview Preparation',
    status: 'Upcoming',
    duration: '4 Weeks',
    topics: ['System Design Mock Interviews', 'Behavioral Question Storyboards', 'Resume ATS Fine-Tuning'],
    deliverable: 'Recruiter-Ready Portfolio & 5 Recorded Mock Interviews',
    state: 'pending',
  },
];

export function RoadmapShowcase() {
  const [selectedMonth, setSelectedMonth] = useState(1);

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Structured Execution
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            A Personalized Roadmap for Your Career
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Turn lofty career ambitions into daily, actionable milestones. A 6-month, month-by-month curriculum calibrated directly to your assessment results and skill gaps.
          </p>
        </div>

        {/* Roadmap Interactive Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Month Selector / Stepper */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              6-Month Progression Timeline
            </div>
            {roadmapMonths.map((m, idx) => {
              const isSelected = selectedMonth === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedMonth(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        m.state === 'done'
                          ? 'bg-emerald-100 text-emerald-700'
                          : m.state === 'active'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.state === 'done' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        `0${idx + 1}`
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {m.month}
                      </div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {m.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        m.state === 'done'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : m.state === 'active'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {m.status}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Month Viewer Panel */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg shadow-slate-100 space-y-6 sticky top-24">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {roadmapMonths[selectedMonth].month}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {roadmapMonths[selectedMonth].duration}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {roadmapMonths[selectedMonth].title}
                  </h3>
                </div>

                <span
                  className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full border ${
                    roadmapMonths[selectedMonth].state === 'done'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : roadmapMonths[selectedMonth].state === 'active'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {roadmapMonths[selectedMonth].status}
                </span>
              </div>

              {/* Core Topics Covered */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Core Competencies & Modules
                </div>
                <div className="space-y-2">
                  {roadmapMonths[selectedMonth].topics.map((topic, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capstone Deliverable */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-1.5">
                <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Monthly Portfolio Deliverable
                </div>
                <div className="text-xs text-slate-800 font-semibold leading-relaxed">
                  {roadmapMonths[selectedMonth].deliverable}
                </div>
              </div>

              {/* Telemetry Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Trackable milestones with interactive checkboxes in your portal.
                </div>
                <Link
                  href="/roadmap"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  <span>Explore Full Curriculum</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
