'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { CareerMatchBreakdown } from '@/lib/hooks/useDashboardRealtime';

interface CareerMatchCardProps {
  careerTitle?: string;
  matchScore?: number;
  breakdown?: CareerMatchBreakdown;
  whyFits?: string[];
}

export function CareerMatchCard({
  careerTitle = 'Full Stack Developer',
  matchScore = 92,
  breakdown = {
    skills: 94,
    interests: 91,
    aptitude: 86,
    education: 88,
    experience: 76,
    preference: 95,
  },
  whyFits = [
    'Strong programming foundation with verified proficiency in modern languages',
    'High analytical reasoning and systematic problem-solving aptitude',
    'Direct alignment with candidate web architecture and cloud interests',
    'Relevant hands-on project experience in full-stack frameworks',
  ],
}: CareerMatchCardProps) {
  const factors = [
    { label: 'Skills', value: breakdown.skills, color: '#2563EB' },
    { label: 'Interests', value: breakdown.interests, color: '#10B981' },
    { label: 'Aptitude', value: breakdown.aptitude, color: '#4F46E5' },
    { label: 'Education', value: breakdown.education, color: '#F59E0B' },
    { label: 'Experience', value: breakdown.experience, color: '#8B5CF6' },
    { label: 'Career Preference', value: breakdown.preference, color: '#06B6D4' },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-200/70 mb-1.5">
            <Sparkles className="h-3 w-3" />
            <span>Top Career Match</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {careerTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic multi-factor compatibility evaluation
          </p>
        </div>

        {/* Compatibility Percentage Callout */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-blue-50/70 border border-blue-200/80 px-4 py-2 rounded-2xl">
          <div className="text-3xl font-black text-blue-700">{matchScore}%</div>
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Compatibility
            </div>
            <div className="text-xs font-semibold text-slate-700">Verified Fit</div>
          </div>
        </div>
      </div>

      {/* Multi-Factor Breakdown Bars Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Dimensional Compatibility Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {factors.map((f) => (
            <div key={f.label} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">{f.label}</span>
                <span className="font-bold text-slate-900">{f.value}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${f.value}%`, backgroundColor: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why this career fits you */}
      <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Why this career fits you</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-600">
          {whyFits.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <Link
          href="/recommendations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group cursor-pointer"
        >
          <span>View Full Analysis</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
