'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck,
  FolderGit2,
  BrainCircuit,
  Award,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { SkillEvidenceItem } from '@/lib/hooks/useSkillIntelligence';

interface SkillEvidenceSectionProps {
  evidence: SkillEvidenceItem[];
}

export function SkillEvidenceSection({ evidence = [] }: SkillEvidenceSectionProps) {
  if (evidence.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>SKILL EVIDENCE & TELEMETRY</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent proof chains explaining why the system validates each capability level across Resume, Projects, and Assessments.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500">
          <span className="text-emerald-600 font-extrabold">
            {evidence.filter((e) => e.verified).length}
          </span>{' '}
          of {evidence.length} skills verified with evidence
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.slice(0, 9).map((item) => (
          <div
            key={item.skill}
            className="rounded-2xl border border-slate-200/90 bg-slate-50/40 p-4 sm:p-5 flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Title & Level */}
              <div className="flex items-center justify-between gap-2">
                <div className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                  {item.skill}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  {item.level}
                </span>
              </div>

              {/* Evidence Pills / Verification Signals */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Verified Proof
                </div>

                <div className="space-y-1.5">
                  {/* Resume Signal */}
                  {item.resume_detected ? (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Detected in latest ATS Resume</span>
                    </div>
                  ) : null}

                  {/* Project Signal */}
                  {item.project_backed ? (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <FolderGit2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>Project: <strong className="font-semibold">{item.project_backed}</strong></span>
                    </div>
                  ) : null}

                  {/* Assessment Signal */}
                  {item.assessment_score ? (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <BrainCircuit className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span>Cognitive Diagnostic ({Math.round(item.assessment_score)}% Score)</span>
                    </div>
                  ) : null}

                  {/* Certifications */}
                  {item.certifications && item.certifications.length > 0 ? (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Award className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>{item.certifications[0]}</span>
                    </div>
                  ) : null}

                  {/* Experience */}
                  {item.years_experience > 0 && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{item.years_experience} years practical experience</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom: Link to Project or Diagnostic */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className={`text-[11px] font-bold ${item.verified ? 'text-emerald-700' : 'text-slate-500'}`}>
                {item.verified ? '✓ Verified Signal' : 'Self-Reported'}
              </span>

              {item.project_backed && (
                <Link
                  href="/projects"
                  className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                >
                  <span>View Project</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
