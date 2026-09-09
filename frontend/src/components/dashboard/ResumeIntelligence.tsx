'use client';

import React from 'react';
import Link from 'next/link';
import { FileCheck, UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { ResumeData } from '@/lib/hooks/useDashboardRealtime';

interface ResumeIntelligenceProps {
  resume?: ResumeData | null;
}

export function ResumeIntelligence({ resume }: ResumeIntelligenceProps) {
  const defaultResume: ResumeData = {
    status: 'ANALYZED',
    ats_score: 88,
    rating: 'Strong',
    skills_detected: 18,
    extracted_skills: ['Python', 'JavaScript', 'React', 'SQL', 'FastAPI', 'Git'],
    missing_keywords: 4,
    missing_keywords_list: ['Docker', 'Kubernetes', 'Microservices', 'CI/CD'],
    career_alignment: 91,
    analyzed_at: new Date().toISOString(),
  };

  const data = resume || defaultResume;

  const isProcessing = data.status === 'PROCESSING';
  const isUploadRequired = data.status === 'UPLOAD_REQUIRED';

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-violet-600 shrink-0" />
            <span>Resume Intelligence</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            ATS keyword extraction and candidate alignment
          </p>
        </div>

        {/* Status Pill */}
        <div className="self-start sm:self-auto">
          {isProcessing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              <span>AI Analyzing Resume...</span>
            </span>
          ) : isUploadRequired ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Upload Required</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Analyzed</span>
            </span>
          )}
        </div>
      </div>

      {isProcessing ? (
        <div className="py-8 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-slate-200/60">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900">
              AI is analyzing your resume...
            </div>
            <div className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Extracting work experience, competencies, and calculating target career ATS alignment.
            </div>
          </div>
        </div>
      ) : isUploadRequired ? (
        <div className="py-6 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-slate-200/60">
          <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900">No Resume Uploaded</div>
            <div className="text-[11px] text-slate-500">
              Upload your resume in PDF or DOCX format to receive instant ATS keyword telemetry.
            </div>
          </div>
          <Link
            href="/resume"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
          >
            <span>Upload Resume</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {/* 2x2 Metric Grid on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                ATS Score
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {data.ats_score}/100
              </div>
              <div className="text-[10px] font-bold text-emerald-600">{data.rating}</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                Skills Detected
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {data.skills_detected}
              </div>
              <div className="text-[10px] text-slate-500">From resume</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                Missing
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-600">
                {data.missing_keywords}
              </div>
              <div className="text-[10px] text-slate-500">High impact</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                Alignment
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-600">
                {data.career_alignment}%
              </div>
              <div className="text-[10px] text-slate-500">Benchmark</div>
            </div>
          </div>

          {/* Missing Keywords Pills */}
          {data.missing_keywords_list.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Top Keywords to Add:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.missing_keywords_list.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <Link
              href="/resume"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 min-h-[40px] flex items-center justify-center sm:justify-start"
            >
              View Full Analysis
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors min-h-[44px]"
            >
              <span>Improve Resume</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
