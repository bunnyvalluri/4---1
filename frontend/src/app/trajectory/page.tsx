'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { MapPin, ChevronDown, ChevronUp, TrendingUp, DollarSign, Briefcase, Zap, Target, CheckCircle2 } from 'lucide-react';

const TRAJECTORIES: Record<string, {
  title: string;
  years: {
    year: number;
    role: string;
    salary: string;
    skills: string[];
    milestones: string[];
    color: string;
  }[];
}> = {
  'Software Engineer': {
    title: 'Software Engineer Career Path',
    years: [
      { year: 1, role: 'Junior Software Engineer', salary: '$70K – $95K', color: 'bg-blue-500', skills: ['HTML/CSS/JS', 'React basics', 'Git', 'REST APIs'], milestones: ['Land first job', 'Ship a production feature', 'Pass code review consistently'] },
      { year: 2, role: 'Software Engineer', salary: '$95K – $130K', color: 'bg-blue-600', skills: ['TypeScript', 'System design basics', 'Testing', 'Docker'], milestones: ['Lead a feature end-to-end', 'Mentor a junior dev', 'Contribute to architecture decisions'] },
      { year: 3, role: 'Senior Engineer I', salary: '$130K – $165K', color: 'bg-indigo-600', skills: ['Distributed systems', 'Cloud (AWS/GCP)', 'Performance tuning', 'Leadership'], milestones: ['Own a major system', 'Define team standards', 'Drive technical roadmap'] },
      { year: 4, role: 'Senior Engineer II', salary: '$155K – $200K', color: 'bg-violet-600', skills: ['Staff-level design', 'Cross-team collaboration', 'Hiring', 'OKR alignment'], milestones: ['Influence org-wide decisions', 'Hire & grow team', 'Drive 10x improvements'] },
      { year: 5, role: 'Staff / Principal Engineer', salary: '$200K – $350K+', color: 'bg-purple-700', skills: ['Technical vision', 'Executive communication', 'Open source', 'Patents'], milestones: ['Set multi-year technical direction', 'Represent engineering externally', 'Drive company-level impact'] },
    ],
  },
  'Data Scientist': {
    title: 'Data Scientist Career Path',
    years: [
      { year: 1, role: 'Junior Data Analyst', salary: '$65K – $90K', color: 'bg-teal-500', skills: ['Python', 'SQL', 'Pandas/NumPy', 'Data visualization'], milestones: ['Build first end-to-end analysis', 'Present insights to stakeholders', 'Learn A/B testing basics'] },
      { year: 2, role: 'Data Scientist', salary: '$90K – $130K', color: 'bg-emerald-600', skills: ['ML models (sklearn)', 'Feature engineering', 'Statistics', 'Jupyter'], milestones: ['Deploy first ML model', 'Improve key business metric', 'Collaborate with engineering'] },
      { year: 3, role: 'Senior Data Scientist', salary: '$130K – $170K', color: 'bg-green-700', skills: ['Deep learning (TensorFlow/PyTorch)', 'MLOps', 'Causal inference', 'NLP'], milestones: ['Own ML roadmap for product area', 'Build reusable ML pipelines', 'Publish internal research'] },
      { year: 4, role: 'Lead Data Scientist', salary: '$160K – $210K', color: 'bg-cyan-700', skills: ['Generative AI', 'Research design', 'Team leadership', 'Experimentation platform'], milestones: ['Lead a team of 3-5 DSs', 'Drive org-wide data strategy', 'Speak at industry conferences'] },
      { year: 5, role: 'Principal DS / Director of ML', salary: '$220K – $400K+', color: 'bg-blue-800', skills: ['AI strategy', 'Executive presence', 'Cross-functional leadership', 'IP'], milestones: ['Shape company AI roadmap', 'Build ML platform', 'Drive competitive moats via data'] },
    ],
  },
  'Product Manager': {
    title: 'Product Manager Career Path',
    years: [
      { year: 1, role: 'Associate Product Manager', salary: '$75K – $100K', color: 'bg-orange-400', skills: ['User research', 'Wireframing', 'Agile/Scrum', 'Data analysis'], milestones: ['Ship first feature', 'Conduct 10+ user interviews', 'Write clear PRDs'] },
      { year: 2, role: 'Product Manager', salary: '$100K – $140K', color: 'bg-orange-500', skills: ['Product strategy', 'Roadmapping', 'Stakeholder management', 'OKRs'], milestones: ['Own a full product area', 'Define & hit quarterly OKRs', 'Build strong eng/design partnership'] },
      { year: 3, role: 'Senior PM', salary: '$140K – $180K', color: 'bg-amber-600', skills: ['Platform thinking', 'Monetization', 'Go-to-market', 'Business acumen'], milestones: ['Launch a major product', 'Drive $1M+ revenue impact', 'Lead cross-functional team'] },
      { year: 4, role: 'Group PM / Principal PM', salary: '$175K – $240K', color: 'bg-yellow-700', skills: ['Portfolio management', 'Org design', 'Executive storytelling', 'M&A evaluation'], milestones: ['Manage multiple PMs', 'Define product org strategy', 'Present to C-suite'] },
      { year: 5, role: 'VP of Product / CPO', salary: '$250K – $500K+', color: 'bg-red-700', skills: ['Company vision', 'Board communication', 'Investor relations', 'Market positioning'], milestones: ['Lead entire product org', 'Define 3-5 year company strategy', 'Drive IPO/acquisition readiness'] },
    ],
  },
};

const DEFAULT_CAREER = 'Software Engineer';

export default function TrajectoryPage() {
  const [selectedCareer, setSelectedCareer] = useState(DEFAULT_CAREER);
  const [expandedYear, setExpandedYear] = useState<number | null>(1);
  const trajectory = TRAJECTORIES[selectedCareer] || TRAJECTORIES[DEFAULT_CAREER];

  return (
    <DashboardShell userName="Candidate" userEmail="" telemetryStatus="Live" lastUpdatedText="just now" notifications={[]} onRefresh={() => {}} onMarkNotificationRead={() => {}}>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Career Trajectory Planner</h1>
            <p className="text-sm text-slate-500 mt-1">Your 5-year roadmap to career success</p>
          </div>
          <select
            value={selectedCareer}
            onChange={e => setSelectedCareer(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            {Object.keys(TRAJECTORIES).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>

        {/* Title card */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-6 w-6 opacity-80" />
            <h2 className="text-xl font-black">{trajectory.title}</h2>
          </div>
          <div className="flex items-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>5 Year Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{trajectory.years[0].salary} → {trajectory.years[4].salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>5 Role Progressions</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 hidden sm:block" />

          <div className="space-y-4">
            {trajectory.years.map((yr, idx) => {
              const isExpanded = expandedYear === yr.year;
              const isCurrent = yr.year === 1;
              return (
                <div key={yr.year} className="relative sm:pl-20">
                  {/* Year dot */}
                  <div className={`absolute left-4 top-5 w-8 h-8 rounded-full ${yr.color} flex items-center justify-center text-white font-black text-sm shadow-md hidden sm:flex z-10`}>
                    {yr.year}
                  </div>

                  <div
                    className={`rounded-2xl border bg-white shadow-xs transition-all cursor-pointer ${isCurrent ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setExpandedYear(isExpanded ? null : yr.year)}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`sm:hidden flex-shrink-0 w-7 h-7 rounded-full ${yr.color} flex items-center justify-center text-white font-black text-xs`}>
                          {yr.year}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm">{yr.role}</span>
                            {isCurrent && <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">START HERE</span>}
                          </div>
                          <div className="text-sm font-bold text-emerald-600 mt-0.5">{yr.salary}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:block">Year {yr.year}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-4 grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Skills to Learn</div>
                          <div className="flex flex-wrap gap-1.5">
                            {yr.skills.map(s => (
                              <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Key Milestones</div>
                          <div className="space-y-1.5">
                            {yr.milestones.map(m => (
                              <div key={m} className="flex items-start gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salary growth chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-black text-slate-700 mb-4">📈 Salary Growth Projection</div>
          <div className="flex items-end gap-3 h-28">
            {trajectory.years.map((yr, i) => {
              const maxSalary = parseInt(trajectory.years[4].salary.replace(/[^0-9]/g, '').slice(0, 3));
              const thisSalary = parseInt(yr.salary.replace(/[^0-9]/g, '').slice(0, 3));
              const height = Math.round((thisSalary / maxSalary) * 100);
              return (
                <div key={yr.year} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-slate-500 font-bold">{yr.salary.split('–')[0].trim()}</div>
                  <div className={`w-full rounded-t-lg ${yr.color} opacity-80`} style={{ height: `${height}%` }} />
                  <div className="text-[10px] text-slate-400">Yr {yr.year}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
