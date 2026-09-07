'use client';

import React from 'react';
import Link from 'next/link';
import {
  Code,
  Brain,
  BarChart,
  Shield,
  Cloud,
  Palette,
  Briefcase,
  Database,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const paths = [
  {
    title: 'Software Engineering',
    slug: 'software-engineer',
    icon: Code,
    description: 'Design, build, and maintain scalable software systems, APIs, and client applications.',
    demand: 'Very High Demand',
    skills: ['Python', 'TypeScript', 'React', 'SQL'],
  },
  {
    title: 'AI / Machine Learning',
    slug: 'ai-ml-engineer',
    icon: Brain,
    description: 'Develop predictive models, neural networks, NLP pipelines, and LLM-powered applications.',
    demand: 'Explosive Growth',
    skills: ['PyTorch', 'Python', 'MLOps', 'Transformers'],
  },
  {
    title: 'Data Science',
    slug: 'data-scientist',
    icon: BarChart,
    description: 'Transform complex business datasets into actionable statistical insights and statistical models.',
    demand: 'High Demand',
    skills: ['Pandas', 'Statistics', 'R', 'Data Viz'],
  },
  {
    title: 'Cybersecurity',
    slug: 'cybersecurity-analyst',
    icon: Shield,
    description: 'Protect organizational networks, safeguard infrastructure, and conduct threat intelligence analysis.',
    demand: 'Critical Need',
    skills: ['Network Security', 'Linux', 'SIEM', 'Pen Testing'],
  },
  {
    title: 'Cloud & DevOps',
    slug: 'cloud-devops-engineer',
    icon: Cloud,
    description: 'Automate build pipelines, orchestrate Kubernetes clusters, and architect resilient cloud systems.',
    demand: 'High Demand',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    title: 'UI/UX Design',
    slug: 'ui-ux-designer',
    icon: Palette,
    description: 'Craft intuitive interfaces, design systems, interactive prototypes, and user research workflows.',
    demand: 'Steady Demand',
    skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping'],
  },
  {
    title: 'Product Management',
    slug: 'product-manager',
    icon: Briefcase,
    description: 'Bridge customer needs, engineering velocity, and business strategy to launch successful products.',
    demand: 'High Demand',
    skills: ['Product Strategy', 'Agile', 'Roadmapping', 'User Analytics'],
  },
  {
    title: 'Data Engineering',
    slug: 'data-engineer',
    icon: Database,
    description: 'Build reliable big-data pipelines, ETL workflows, and distributed data lakes for analytics.',
    demand: 'Very High Demand',
    skills: ['Spark', 'SQL', 'Kafka', 'Data Warehousing'],
  },
];

export function CareerPaths() {
  return (
    <section id="career-paths" className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Industry Disciplines
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Explore Tech Career Paths
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Calibrated across 20+ specialized technical roles with transparent benchmarks, market compensation insights, and required skills.
          </p>
        </div>

        {/* 8 Career Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.slug}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Icon & Demand Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {path.demand}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
                    {path.description}
                  </p>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1 mb-5">
                    {path.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href={`/careers/${path.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors"
                  >
                    <span>View Career</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore All Link */}
        <div className="mt-12 text-center">
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
          >
            <span>Explore All 20+ Calibrated Disciplines</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
