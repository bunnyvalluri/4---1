'use client';

import React from 'react';
import { Map, Plus, Clock, BookOpen, Layers } from 'lucide-react';

export default function AdminRoadmapsPage() {
  const templates = [
    {
      id: 'rm-1',
      title: 'AI / Machine Learning Engineer Mastery',
      career: 'AI / Machine Learning Engineer',
      duration_weeks: 16,
      milestones_count: 5,
      description: 'Foundations of linear algebra, PyTorch training, model evaluation, and inference deployment.',
    },
    {
      id: 'rm-2',
      title: 'Full Stack Cloud Architect',
      career: 'Full Stack Cloud Engineer',
      duration_weeks: 14,
      milestones_count: 4,
      description: 'Next.js 15 app router, FastAPI backend patterns, PostgreSQL schemas, and containerized deployment.',
    },
    {
      id: 'rm-3',
      title: 'Enterprise MLOps & Infrastructure',
      career: 'DevOps & MLOps Architect',
      duration_weeks: 12,
      milestones_count: 4,
      description: 'Kubernetes orchestration, CI/CD automated gates, model drift monitoring, and Prometheus telemetry.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Roadmap Templates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate curriculum structures, milestone objectives, and recommended durations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {tpl.career}
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{tpl.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{tpl.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {tpl.duration_weeks} Weeks
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {tpl.milestones_count} Milestones
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
