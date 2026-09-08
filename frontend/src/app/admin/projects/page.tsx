'use client';

import React from 'react';
import { FolderKanban, Plus, Clock, Code, Sparkles } from 'lucide-react';

export default function AdminProjectsPage() {
  const projects = [
    {
      id: 'prj-1',
      title: 'Neural Recommendation Engine with FastAPI',
      career: 'AI / Machine Learning Engineer',
      difficulty: 'Hard',
      skills: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
      duration: '3 weeks',
      description: 'Implement a real-time vector embedding recommendation service with cosine similarity scoring.',
    },
    {
      id: 'prj-2',
      title: 'Multi-Tenant SaaS Application with Next.js 15',
      career: 'Full Stack Cloud Engineer',
      difficulty: 'Intermediate',
      skills: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      duration: '4 weeks',
      description: 'Build an authenticated multi-tenant workspace with role-based edge middleware and SSR caching.',
    },
    {
      id: 'prj-3',
      title: 'Automated Kubernetes GitOps Pipeline',
      career: 'DevOps & MLOps Architect',
      difficulty: 'Advanced',
      skills: ['Kubernetes', 'Helm', 'ArgoCD', 'GitHub Actions'],
      duration: '2 weeks',
      description: 'Construct a zero-downtime canary deployment pipeline with automated rollback on test failures.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Project Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate hands-on portfolio projects assigned to candidates in their learning roadmaps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {p.career}
                </span>
                <span className="text-[11px] font-bold text-slate-500">{p.difficulty}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {p.skills.map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Estimated duration: {p.duration}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
