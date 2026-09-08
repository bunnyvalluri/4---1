'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Brain,
  ClipboardCheck,
  Sparkles,
  FileText,
  Map,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Building,
} from 'lucide-react';

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params?.id as string;
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;
    fetch(`/api/admin/candidates/${candidateId}`)
      .then((res) => res.json())
      .then((data) => {
        setCandidate(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [candidateId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-32 bg-white border border-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!candidate || candidate.error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900">Candidate not found</p>
        <Link href="/admin/candidates" className="text-xs font-semibold text-blue-600">
          ← Back to Candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/candidates"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Candidate Directory</span>
      </Link>

      {/* Candidate Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{candidate.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {candidate.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{candidate.email}</span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Target Career</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {candidate.profile?.target_career || 'Software Engineering'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {candidate.profile?.location || 'Remote'}
          </p>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Results */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Aptitude Evaluation Records
            </h2>
          </div>

          {candidate.assessment_attempts?.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No assessment attempts recorded yet.</p>
          ) : (
            candidate.assessment_attempts?.map((att: any) => (
              <div key={att.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Overall Aptitude Score</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                    {att.score}%
                  </span>
                </div>
                {att.category_scores && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    {Object.entries(att.category_scores).map(([k, v]: [string, any]) => (
                      <div key={k} className="flex justify-between text-slate-600">
                        <span className="capitalize">{k.toLowerCase()}</span>
                        <span className="font-semibold text-slate-900">{v}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* AI Career Recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Career Recommendations
            </h2>
          </div>

          {candidate.career_recommendations?.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No career recommendations calculated yet.</p>
          ) : (
            candidate.career_recommendations?.map((rec: any) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rec.career_title}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
                    {rec.match_score}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.explanation}</p>
              </div>
            ))
          )}
        </div>

        {/* Verified Skills Catalog */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Brain className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Profile & Verified Skills
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {candidate.skills?.map((sk: any) => (
              <div
                key={sk.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="font-semibold text-slate-800">{sk.name}</span>
                <span className="text-[10px] text-slate-500 font-medium capitalize">
                  ({sk.proficiency.toLowerCase()})
                </span>
                {sk.verified && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Resume ATS Scanner Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-teal-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Resume ATS Analysis
            </h2>
          </div>

          {candidate.resume_analyses?.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No resume uploaded or analyzed.</p>
          ) : (
            candidate.resume_analyses?.map((ra: any) => (
              <div key={ra.id} className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-900">ATS Match Score</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800">
                    {ra.ats_score}% ATS
                  </span>
                </div>
                {ra.missing_skills?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Missing Skills Identified</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {ra.missing_skills.map((ms: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          {ms}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
