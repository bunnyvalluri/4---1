'use client';

import React from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  Sparkles,
  Target,
  Map,
  FileCheck,
  FolderGit2,
  MessageSquare,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    id: 'assessment',
    title: 'Career Assessment',
    category: 'Diagnostic Engine',
    description:
      'Evaluate cognitive aptitude, quantitative reasoning, and domain affinity through adaptive, psychometrically calibrated questions.',
    icon: BrainCircuit,
    link: '/assessment',
    actionText: 'Take Assessment',
    featured: true,
    highlights: ['Psychometric alignment', 'Adaptive questioning', 'Real-time telemetry'],
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'recommendations',
    title: 'AI Career Recommendations',
    category: 'Matching Algorithm',
    description:
      'Receive multi-factor compatibility scores grounded in your verified technical skills, academic degree, and career aspirations.',
    icon: Sparkles,
    link: '/recommendations',
    actionText: 'Explore Matches',
    featured: true,
    highlights: ['7-factor utility calculation', 'Confidence indices', 'Cross-discipline parity'],
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'skill-gap',
    title: 'Skill-Gap Analysis',
    category: 'Skill Telemetry',
    description:
      'Instantly uncover the precise Delta between your existing competencies and what top employers benchmark for each target role.',
    icon: Target,
    link: '/skills',
    actionText: 'Analyze Gaps',
    featured: false,
    highlights: ['Current vs. required levels', 'Prioritized learning'],
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'roadmap',
    title: 'Personalized Learning Roadmap',
    category: 'Curriculum Timeline',
    description:
      'Step-by-step 6-month roadmap designed to bridge your critical skill gaps through curated milestones and execution tasks.',
    icon: Map,
    link: '/roadmap',
    actionText: 'View Roadmap',
    featured: false,
    highlights: ['Month-by-month structure', 'Live progress checklist'],
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'resume',
    title: 'Resume Analyzer',
    category: 'ATS Diagnostic',
    description:
      'Scan PDF/DOCX resumes for applicant tracking system compatibility, missing role keywords, and impactful bullet rewrites.',
    icon: FileCheck,
    link: '/resume',
    actionText: 'Scan Resume',
    featured: false,
    highlights: ['ATS score breakdown', 'Metric-focused phrasing'],
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    id: 'projects',
    title: 'Project Recommendations',
    category: 'Portfolio Builder',
    description:
      'Build realistic, production-level portfolio projects targeted to validate your emerging skills for recruiter evaluation.',
    icon: FolderGit2,
    link: '/projects',
    actionText: 'Discover Projects',
    featured: false,
    highlights: ['Production architectures', 'GitHub-ready specs'],
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'assistant',
    title: 'AI Career Assistant',
    category: 'Contextual Mentorship',
    description:
      'Ask technical architecture questions, prepare for behavioral interviews, and receive tailored advice grounded in your profile.',
    icon: MessageSquare,
    link: '/chat',
    actionText: 'Chat with AI',
    featured: false,
    highlights: ['Grounded in your roadmap', 'Architecture mock queries'],
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'progress',
    title: 'Progress Tracking',
    category: 'Execution Metrics',
    description:
      'Monitor your career readiness score over time as you complete roadmap milestones, master skills, and update your resume.',
    icon: BarChart3,
    link: '/dashboard',
    actionText: 'Track Readiness',
    featured: false,
    highlights: ['Completion analytics', 'Milestone velocity tracking'],
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Comprehensive Platform
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Everything You Need to Build Your Career
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            From initial diagnostic discovery to job-ready execution, CareerAI provides the structured, intelligent toolkit to advance your trajectory.
          </p>
        </div>

        {/* Feature Cards Grid with Visual Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 p-6 sm:p-7 ${
                  feat.featured
                    ? 'border-blue-200 bg-gradient-to-b from-blue-50/30 to-white shadow-md hover:shadow-lg hover:border-blue-300'
                    : 'border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top row: Icon & Category */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                        feat.featured
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                          : 'bg-slate-50 border border-slate-200 text-blue-600'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${feat.badgeColor}`}>
                      {feat.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {feat.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-1 mb-6 border-t border-slate-100">
                    {feat.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer link */}
                <div className="pt-2">
                  <Link
                    href={feat.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
