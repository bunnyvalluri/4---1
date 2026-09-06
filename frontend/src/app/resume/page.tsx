'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCw,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [directText, setDirectText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, historyRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/resume/history'),
        ]);
        const profData = await profRes.json();
        const historyData = await historyRes.json();

        if (profData?.user) setUserProfile(profData.user);
        if (historyData?.history && historyData.history.length > 0) {
          setHistory(historyData.history);
          setAnalysis(historyData.history[0]);
        }
      } catch (err) {
        console.error('Failed to load resume telemetry:', err);
      }
    }
    loadData();
  }, []);

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !directText.trim()) {
      setError('Please provide a PDF/DOCX file or paste resume text');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (directText) formData.append('text', directText);

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      if (data.analysis) {
        setAnalysis(data.analysis);
        setHistory((prev) => [data.analysis, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
              <FileCheck className="h-4 w-4" />
              <span>ATS INTELLIGENCE & RESUME ANALYZER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Resume Screening & ATS Optimization
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Upload your PDF or DOCX document to extract verified skills, measure ATS keyword pass rates, and rewrite weak bullet points.
            </p>
          </div>

          {/* Upload & Form Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadAndAnalyze} className="space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors space-y-3">
                <Upload className="mx-auto h-10 w-10 text-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">
                    {file ? file.name : 'Choose a PDF or DOCX file to analyze'}
                  </div>
                  <div className="text-xs text-slate-500">Supported formats: .pdf, .docx, or .txt (Max 10MB)</div>
                </div>
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="resume-file"
                  className="inline-block cursor-pointer rounded-xl bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  Browse Files
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Or Paste Resume Text</label>
                <textarea
                  rows={4}
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  placeholder="Paste experience, project achievements, or education details..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {analyzing ? <RotateCw className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                <span>{analyzing ? 'Extracting & Scoring ATS Keywords...' : 'Start ATS Analysis'}</span>
              </button>
            </form>
          </div>

          {/* Results Deep-Dive */}
          {analysis && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Analysis Diagnostic</span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Results for {analysis.fileName || 'Uploaded Document'}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-blue-600">{analysis.atsScore} / 100</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">ATS Pass Index</div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {analysis.summary && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-blue-900 block mb-1">Executive Summary:</strong>
                  {analysis.summary}
                </div>
              )}

              {/* Skills & Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Skills Detected ({analysis.extractedSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(analysis.extractedSkills || []).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Recommended ATS Keywords ({analysis.suggestedKeywords?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(analysis.suggestedKeywords || []).map((kw: string) => (
                      <span key={kw} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-blue-700">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bullet Points Analysis */}
              {analysis.weakBulletPoints && analysis.weakBulletPoints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Actionable Bullet Point Rewrites (Metric-Driven)
                  </h4>
                  <div className="space-y-2.5">
                    {analysis.weakBulletPoints.map((bp: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                        <div className="text-slate-500 line-through">&ldquo;{bp.original}&rdquo;</div>
                        <div className="text-emerald-700 font-semibold">&ldquo;{bp.suggested}&rdquo;</div>
                        <div className="text-[11px] text-amber-700 font-medium pt-0.5">Issue: {bp.issue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
