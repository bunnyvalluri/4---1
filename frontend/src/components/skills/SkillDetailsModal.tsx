'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Award,
  ShieldCheck,
  TrendingUp,
  FolderGit2,
  BookOpen,
  Calendar,
  ExternalLink,
  Edit2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { SkillItem } from '@/lib/hooks/useSkillIntelligence';

interface SkillDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillItem | null;
  onEdit: (skill: SkillItem) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function SkillDetailsModal({
  isOpen,
  onClose,
  skill,
  onEdit,
}: SkillDetailsModalProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [evidenceData, setEvidenceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !skill) return;

    async function fetchDetails() {
      setLoading(true);
      try {
        const [anRes, evRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/v1/skills/${encodeURIComponent(skill!.name)}/analysis`),
          fetch(`${BACKEND_URL}/api/v1/skills/${encodeURIComponent(skill!.name)}/evidence`),
        ]);
        if (anRes.ok) setAnalysis(await anRes.json());
        if (evRes.ok) setEvidenceData(await evRes.json());
      } catch (err) {
        console.warn('Failed to load skill details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [isOpen, skill]);

  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {skill.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {skill.level} Proficiency
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1.5">{skill.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Level & Telemetry Quick Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Years Experience
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {skill.years_of_experience} yrs
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Verification Signal
            </span>
            <span
              className={`font-extrabold text-sm ${
                skill.verified ? 'text-emerald-700' : 'text-slate-600'
              }`}
            >
              {skill.verified ? 'Verified Proof' : 'Self-Reported'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Learning Status
            </span>
            <span className="font-extrabold text-blue-600 text-sm">
              {skill.learning_status}
            </span>
          </div>
        </div>

        {/* Career Impact Breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Career Impact Across Roles</span>
          </div>

          <div className="space-y-2">
            {analysis?.supported_careers ? (
              analysis.supported_careers.map((c: any) => (
                <div
                  key={c.career_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs"
                >
                  <span className="font-bold text-slate-800">{c.career_title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {c.is_required ? 'Core Requirement' : 'Recommended'}
                    </span>
                    <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {c.impact_score}% Impact
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">Calculating career impact...</div>
            )}
          </div>
        </div>

        {/* Evidence Sources Details */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Telemetry Evidence Chain</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            {evidenceData?.resume_detected && (
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Detected in candidate ATS resume document</span>
              </div>
            )}
            {evidenceData?.project_backed && (
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <FolderGit2 className="h-4 w-4 text-blue-600" />
                <span>Demonstrated in project: <strong className="font-semibold">{evidenceData.project_backed}</strong></span>
              </div>
            )}
            {evidenceData?.assessment_score && (
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Award className="h-4 w-4 text-purple-600" />
                <span>Cognitive diagnostic performance ({Math.round(evidenceData.assessment_score)}% Benchmark)</span>
              </div>
            )}
            {(!evidenceData?.resume_detected && !evidenceData?.project_backed && !evidenceData?.assessment_score) && (
              <div className="text-slate-500 italic">
                Self-reported profile capability. Bridge with an ATS scan or project completion to elevate verification signal.
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(skill);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Skill</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/roadmap"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Start / Continue Learning</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
