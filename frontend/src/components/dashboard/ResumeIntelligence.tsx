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
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-violet-600" />
            <span>Resume Intelligence</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            ATS keyword extraction and candidate alignment scoring
          </p>
        </div>

        {/* Status Pill */}
        <div className="self-start sm:self-auto">
          {isProcessing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>AI Analyzing Resume...</span>
            </span>
          ) : isUploadRequired ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Upload Required</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
          >
            <span>Upload Resume</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ATS Score
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {data.ats_score}/100
              </div>
              <div className="text-[10px] font-bold text-emerald-600">{data.rating}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Skills Detected
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {data.skills_detected}
              </div>
              <div className="text-[10px] text-slate-500">From resume text</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Missing Keywords
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-600">
                {data.missing_keywords}
              </div>
              <div className="text-[10px] text-slate-500">High ATS impact</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Career Alignment
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-600">
                {data.career_alignment}%
              </div>
              <div className="text-[10px] text-slate-500">Benchmark match</div>
            </div>
          </div>

          {/* Missing Keywords Pills */}
          {data.missing_keywords_list.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Top Keywords to Add:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.missing_keywords_list.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              href="/resume"
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              View Full Analysis
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
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
