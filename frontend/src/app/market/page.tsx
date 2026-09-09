'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { TrendingUp, DollarSign, Building2, Flame, BarChart3 } from 'lucide-react';

const MARKET_DATA: Record<string, {
  salaryMin: number; salaryMid: number; salaryMax: number;
  demand: 'Very High' | 'High' | 'Moderate' | 'Emerging';
  growth: number;
  topSkills: string[];
  topCompanies: { name: string; openings: number; color: string }[];
  description: string;
}> = {
  'Software Engineer': {
    salaryMin: 80, salaryMid: 130, salaryMax: 220,
    demand: 'Very High', growth: 25,
    topSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'System Design'],
    topCompanies: [
      { name: 'Google', openings: 1240, color: 'bg-blue-500' },
      { name: 'Meta', openings: 890, color: 'bg-indigo-500' },
      { name: 'Amazon', openings: 2100, color: 'bg-orange-500' },
      { name: 'Microsoft', openings: 1560, color: 'bg-cyan-500' },
      { name: 'Startups', openings: 8900, color: 'bg-emerald-500' },
    ],
    description: 'Software engineering remains one of the highest-demand fields globally, with explosive growth in AI/ML, cloud, and fintech sectors.',
  },
  'Data Scientist': {
    salaryMin: 90, salaryMid: 145, salaryMax: 250,
    demand: 'Very High', growth: 35,
    topSkills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch', 'Statistics', 'Spark', 'Airflow', 'LLMs', 'MLOps'],
    topCompanies: [
      { name: 'OpenAI', openings: 340, color: 'bg-slate-700' },
      { name: 'Google DeepMind', openings: 280, color: 'bg-blue-600' },
      { name: 'Netflix', openings: 190, color: 'bg-red-600' },
      { name: 'Stripe', openings: 220, color: 'bg-violet-600' },
      { name: 'Palantir', openings: 410, color: 'bg-teal-600' },
    ],
    description: 'Data science is booming with the AI revolution. ML engineers and AI researchers are the most in-demand roles globally.',
  },
  'Product Manager': {
    salaryMin: 100, salaryMid: 155, salaryMax: 280,
    demand: 'High', growth: 19,
    topSkills: ['Product Strategy', 'Roadmapping', 'User Research', 'Data Analysis', 'Agile', 'Figma', 'SQL basics', 'OKRs', 'A/B Testing', 'Stakeholder Mgmt'],
    topCompanies: [
      { name: 'Airbnb', openings: 120, color: 'bg-rose-500' },
      { name: 'Uber', openings: 180, color: 'bg-slate-900' },
      { name: 'Notion', openings: 45, color: 'bg-slate-600' },
      { name: 'Figma', openings: 60, color: 'bg-purple-500' },
      { name: 'Canva', openings: 95, color: 'bg-blue-400' },
    ],
    description: 'Product management roles are highly competitive but well-compensated. Strong bias toward candidates with technical + data backgrounds.',
  },
  'UX Designer': {
    salaryMin: 70, salaryMid: 110, salaryMax: 180,
    demand: 'High', growth: 16,
    topSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility', 'Motion Design', 'Usability Testing', 'Information Architecture', 'HTML/CSS basics', 'Storytelling'],
    topCompanies: [
      { name: 'Apple', openings: 230, color: 'bg-slate-800' },
      { name: 'Adobe', openings: 310, color: 'bg-red-600' },
      { name: 'Figma', openings: 80, color: 'bg-purple-500' },
      { name: 'Shopify', openings: 155, color: 'bg-emerald-600' },
      { name: 'HubSpot', openings: 125, color: 'bg-orange-500' },
    ],
    description: 'UX design is evolving rapidly with AI-assisted tools and accessibility requirements. Senior UX roles command premium compensation.',
  },
  'DevOps Engineer': {
    salaryMin: 85, salaryMid: 135, salaryMax: 210,
    demand: 'Very High', growth: 28,
    topSkills: ['Kubernetes', 'Terraform', 'AWS/GCP/Azure', 'CI/CD', 'Docker', 'Ansible', 'Prometheus', 'Linux', 'Python scripting', 'Security'],
    topCompanies: [
      { name: 'HashiCorp', openings: 180, color: 'bg-violet-600' },
      { name: 'Datadog', openings: 290, color: 'bg-purple-600' },
      { name: 'AWS', openings: 1800, color: 'bg-orange-500' },
      { name: 'Cloudflare', openings: 340, color: 'bg-orange-600' },
      { name: 'Vercel', openings: 75, color: 'bg-slate-900' },
    ],
    description: 'DevOps and platform engineering are mission-critical for every tech company. Cloud-native skills command a massive premium.',
  },
};

const DEMAND_COLORS: Record<string, string> = {
  'Very High': 'bg-emerald-100 text-emerald-700',
  'High': 'bg-blue-100 text-blue-700',
  'Moderate': 'bg-amber-100 text-amber-700',
  'Emerging': 'bg-violet-100 text-violet-700',
};

export default function MarketPage() {
  const [selected, setSelected] = useState('Software Engineer');
  const data = MARKET_DATA[selected];

  const salaryMax = 280;

  return (
    <DashboardShell userName="Candidate" userEmail="" telemetryStatus="Live" lastUpdatedText="just now" notifications={[]} onRefresh={() => {}} onMarkNotificationRead={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Job Market Intelligence</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time salary data, demand trends & top companies hiring</p>
          </div>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            {Object.keys(MARKET_DATA).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
            <div className="text-xs font-black uppercase text-slate-400 tracking-wide">Min Salary</div>
            <div className="text-2xl font-black text-slate-900">${data.salaryMin}K</div>
            <div className="text-xs text-slate-500">Entry level</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
            <div className="text-xs font-black uppercase text-slate-400 tracking-wide">Mid Salary</div>
            <div className="text-2xl font-black text-blue-600">${data.salaryMid}K</div>
            <div className="text-xs text-slate-500">Mid-career avg</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
            <div className="text-xs font-black uppercase text-slate-400 tracking-wide">Max Salary</div>
            <div className="text-2xl font-black text-emerald-600">${data.salaryMax}K</div>
            <div className="text-xs text-slate-500">Senior/Staff</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
            <div className="text-xs font-black uppercase text-slate-400 tracking-wide">Job Growth</div>
            <div className="text-2xl font-black text-violet-600">+{data.growth}%</div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DEMAND_COLORS[data.demand]}`}>{data.demand}</span>
          </div>
        </div>

        {/* Salary bar chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-black text-slate-800">Salary Distribution — {selected}</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Entry Level', value: data.salaryMin, color: 'bg-slate-300' },
              { label: 'Mid-Career', value: data.salaryMid, color: 'bg-blue-500' },
              { label: 'Senior/Staff', value: data.salaryMax, color: 'bg-emerald-500' },
            ].map(bar => (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{bar.label}</span>
                  <span className="font-black text-slate-900">${bar.value}K / yr</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                    style={{ width: `${Math.round((bar.value / salaryMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top skills + companies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills demand */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-black text-slate-800">Top Skills in Demand</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.topSkills.map((skill, i) => (
                <span
                  key={skill}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    i < 3 ? 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-300' :
                    i < 6 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {i < 3 && '🔥 '}{skill}
                </span>
              ))}
            </div>
          </div>

          {/* Top companies */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-black text-slate-800">Top Companies Hiring</span>
            </div>
            <div className="space-y-3">
              {data.topCompanies.map(company => {
                const maxOpenings = Math.max(...data.topCompanies.map(c => c.openings));
                return (
                  <div key={company.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700">{company.name}</span>
                      <span className="font-black text-slate-900">{company.openings.toLocaleString()} openings</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${company.color} transition-all duration-700`}
                        style={{ width: `${Math.round((company.openings / maxOpenings) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Insight card */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-lg mb-1">Market Insight</div>
              <p className="text-sm opacity-90 leading-relaxed">{data.description}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
