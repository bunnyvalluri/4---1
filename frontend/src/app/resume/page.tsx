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
  Copy,
  Check,
  Zap,
  Clock,
  Shield,
  X,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [directText, setDirectText] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<'Uploading' | 'Processing' | 'Analyzing' | 'Almost Complete' | 'Completed'>('Uploading');

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
      setError('Please choose a PDF/DOCX file or paste your resume text');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisStep('Uploading');

    const stepTimer1 = setTimeout(() => setAnalysisStep('Processing'), 700);
    const stepTimer2 = setTimeout(() => setAnalysisStep('Analyzing'), 1500);
    const stepTimer3 = setTimeout(() => setAnalysisStep('Almost Complete'), 2600);

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

      setAnalysisStep('Completed');
      if (data.analysis) {
        setAnalysis(data.analysis);
        setHistory((prev) => [data.analysis, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const atsScore = analysis?.atsScore ?? 56;
  const scoreTier =
    atsScore >= 85
      ? { label: 'Optimal Match', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : atsScore >= 70
      ? { label: 'Competitive', color: 'text-blue-700 bg-blue-50 border-blue-200' }
      : { label: 'Needs Optimization', color: 'text-amber-800 bg-amber-50 border-amber-200' };

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row overflow-x-hidden w-full">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <main className="flex-1 min-w-0 py-4 sm:py-8 px-3.5 sm:px-6 lg:px-10 pb-32 lg:pb-10 overflow-y-auto overflow-x-hidden max-w-5xl mx-auto w-full">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700">
                  <FileCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Applicant Tracking System (ATS) Intelligence</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Resume Scanner & Keyword Optimizer
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Extract verified skills, detect missing keyword density for target roles, and rewrite weak bullet points with quantifiable impact.
                </p>
              </div>

              {history.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-center">
                  <span>Scans: {history.length} runs</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload & Form Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {analyzing && (
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <RotateCw className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-blue-900">
                      {analysisStep === 'Uploading' && 'Uploading document to secure storage...'}
                      {analysisStep === 'Processing' && 'Extracting text and structural sections...'}
                      {analysisStep === 'Analyzing' && 'Auditing ATS score and keyword density...'}
                      {analysisStep === 'Almost Complete' && 'Synthesizing recommendations...'}
                      {analysisStep === 'Completed' && 'Analysis complete!'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700">
                    {analysisStep === 'Uploading' && '25%'}
                    {analysisStep === 'Processing' && '55%'}
                    {analysisStep === 'Analyzing' && '80%'}
                    {analysisStep === 'Almost Complete' && '95%'}
                    {analysisStep === 'Completed' && '100%'}
                  </span>
                </div>
                <div className="w-full bg-blue-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width:
                        analysisStep === 'Uploading'
                          ? '25%'
                          : analysisStep === 'Processing'
                          ? '55%'
                          : analysisStep === 'Analyzing'
                          ? '80%'
                          : analysisStep === 'Almost Complete'
                          ? '95%'
                          : '100%',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
                  <span className={analysisStep === 'Uploading' ? 'text-blue-700 font-bold' : ''}>Uploading</span>
                  <span className={analysisStep === 'Processing' ? 'text-blue-700 font-bold' : ''}>Processing</span>
                  <span className={analysisStep === 'Analyzing' ? 'text-blue-700 font-bold' : ''}>Analyzing</span>
                  <span className={analysisStep === 'Almost Complete' ? 'text-blue-700 font-bold' : ''}>Almost Complete</span>
                  <span className={analysisStep === 'Completed' ? 'text-blue-700 font-bold' : ''}>Completed</span>
                </div>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Input Method
              </span>
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 xs:flex-none px-3 py-2 min-h-[36px] text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    inputMode === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 xs:flex-none px-3 py-2 min-h-[36px] text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    inputMode === 'paste' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Direct Paste
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadAndAnalyze} className="space-y-4">
              {inputMode === 'upload' ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-300 p-6 sm:p-8 text-center bg-slate-50/50 hover:bg-blue-50/20 hover:border-blue-300 transition-all space-y-3">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-2xs">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 break-all px-2">
                      {file ? file.name : 'Choose a PDF, DOCX, or TXT document'}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500">
                      Supports standard applicant formats (Max 10MB)
                    </div>
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
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <label
                      htmlFor="resume-file"
                      className="cursor-pointer min-h-[44px] inline-flex items-center justify-center rounded-xl bg-white border border-slate-300/90 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                    >
                      Browse Files
                    </label>
                    {file && (
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-xs font-bold text-red-600 hover:underline min-h-[44px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Paste Full Resume Text</label>
                  <textarea
                    rows={6}
                    value={directText}
                    onChange={(e) => setDirectText(e.target.value)}
                    placeholder="Paste work experience, bullet points, technical skills, and project summaries here..."
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 sm:p-4 text-base sm:text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  {analyzing ? <RotateCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>{analyzing ? 'Scanning Keywords & Scoring...' : 'Analyze Resume Telemetry'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results Deep-Dive */}
          {analysis && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-8 shadow-xs space-y-6 sm:space-y-8 min-w-0">
              {/* Score Header - Fully responsive across mobile, tablet, desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 min-w-0">
                <div className="space-y-1 min-w-0 overflow-hidden">
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-blue-600 uppercase tracking-wider block">
                    Diagnostic Report
                  </span>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight break-all sm:break-normal leading-tight">
                    {analysis.fileName || 'Parsed Resume Assessment'}
                  </h2>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 w-full sm:w-auto shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight leading-none">
                      {atsScore} / 100
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                      ATS Pass Index
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border shrink-0 ${scoreTier.color}`}>
                    {scoreTier.label}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              {analysis.summary && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1.5">
                  <strong className="text-blue-900 font-bold block">Executive ATS Findings:</strong>
                  <p className="break-words">{analysis.summary}</p>
                </div>
              )}

              {/* Extracted Skills & Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Detected Skills */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 sm:p-5 space-y-3 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Extracted Verified Skills ({analysis.extractedSkills?.length || 0})</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysis.extractedSkills || []).map((s: string) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-semibold text-slate-800 shadow-2xs break-words"
                      >
                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{s}</span>
                      </span>
                    ))}
                    {(!analysis.extractedSkills || analysis.extractedSkills.length === 0) && (
                      <span className="text-xs text-slate-400">No skills parsed</span>
                    )}
                  </div>
                </div>

                {/* Missing ATS Keywords */}
                <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-4 sm:p-5 space-y-3 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Recommended Keywords ({analysis.suggestedKeywords?.length || 0})</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysis.suggestedKeywords || []).map((kw: string) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => copyToClipboard(kw)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50 transition-colors cursor-pointer break-words"
                        title="Click to copy keyword"
                      >
                        <span>+ {kw}</span>
                        {copiedKeyword === kw ? (
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        ) : (
                          <Copy className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bullet Points Actionable Optimizer */}
              {analysis.weakBulletPoints && analysis.weakBulletPoints.length > 0 && (
                <div className="space-y-4 min-w-0">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Metric-Driven Bullet Point Rewrites
                    </h4>
                    <p className="text-xs text-slate-500">
                      Transform passive statements into high-impact, measurable recruiter magnet achievements.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {analysis.weakBulletPoints.map((bp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5 text-xs min-w-0"
                      >
                        {/* Original */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">
                            Before • Lacks Impact & Quantification
                          </span>
                          <div className="text-slate-500 line-through pl-2.5 sm:pl-3 border-l-2 border-red-300 break-words">
                            &ldquo;{bp.original}&rdquo;
                          </div>
                        </div>

                        {/* Rewritten */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                            AI Recommended Production Rewrite
                          </span>
                          <div className="text-slate-900 font-bold pl-2.5 sm:pl-3 border-l-2 border-emerald-500 bg-emerald-50/40 p-2 sm:p-2.5 rounded-r-xl break-words">
                            &ldquo;{bp.suggested}&rdquo;
                          </div>
                        </div>

                        <div className="text-[11px] text-amber-700 font-semibold pt-0.5">
                          Diagnosis: {bp.issue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
