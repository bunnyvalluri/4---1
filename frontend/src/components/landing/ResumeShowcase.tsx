'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  FileText,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

export function ResumeShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Realistic ATS UI */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/40 space-y-6">
              
              {/* Card Top: Resume File Info & Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>alex_software_engineer_cv.pdf</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">PDF</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Parsed via CareerAI ATS Parser • 2 pages</div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ATS Score</span>
                  <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                    <span className="text-blue-600">88</span>
                    <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* ATS Compatibility Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>ATS Compatibility: Strong</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Standard Formatting Verified</span>
              </div>

              {/* Detected Skills vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Detected Skills */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Detected Skills</span>
                    <span className="text-[10px] text-emerald-600 font-bold">4 Verified</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'React', 'SQL', 'Git'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                      >
                        <Check className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 space-y-2">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Missing Skills</span>
                    <span className="text-[10px] text-amber-700 font-bold">2 Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Docker', 'AWS'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-900"
                      >
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Actionable Suggestion Callout with Impact Comparison */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Actionable Suggestion: Improve Project Impact Statements
                </div>
                
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-white border border-red-100 text-slate-500">
                    <span className="font-bold text-red-600 text-[10px] uppercase block">Weak Phrasing</span>
                    <span className="line-through">&ldquo;Built endpoints for user database in Node.&rdquo;</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-emerald-200 text-slate-800">
                    <span className="font-bold text-emerald-600 text-[10px] uppercase block">AI Optimized Phrasing</span>
                    <span>&ldquo;Engineered RESTful Node APIs with PostgreSQL caching, slashing query latency by 42% across 12,000 requests.&rdquo;</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Copy & Narrative */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Resume Intelligence
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Turn Your Resume Into a Career Advantage
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Most applicant tracking systems reject unqualified formatting and keyword mismatches before a human recruiter even sees your application. CareerAI scans your uploaded resume to give you clear, actionable feedback.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Applicant Tracking System Parsing</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Evaluates header structure, font parsing, table safety, and standard section demarcations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Automated Role Keyword Cross-Check</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Compares detected technical proficiencies directly against real industry job specifications.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Quantifiable Metric Phrasing</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Transforms passive statements into metric-focused bullet points that highlight business impact.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/resume"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload & Scan Your Resume</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
