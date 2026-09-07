'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Sparkles,
  Award,
  HelpCircle,
  Check,
  Zap,
  BarChart3,
  Clock,
  Compass,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [qRes, profRes] = await Promise.all([
          fetch('/api/assessment/questions'),
          fetch('/api/profile'),
        ]);

        const qData = await qRes.json();
        const profData = await profRes.json();

        if (profData?.user) setUserProfile(profData.user);
        if (qData?.questions && qData.questions.length > 0) {
          setQuestions(qData.questions);
        }
      } catch (err) {
        console.error('Failed to load assessment:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers({ ...answers, [questionId]: optionIdx });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        // Recalculate recommendations in the background
        fetch('/api/recommendations', { method: 'POST' }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200/80 rounded-2xl" />
        <div className="h-96 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const isAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const getCategoryColor = (cat: string) => {
    const c = (cat || '').toUpperCase();
    if (c.includes('LOGICAL')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (c.includes('QUANTITATIVE')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (c.includes('VERBAL')) return 'bg-violet-50 text-violet-700 border-violet-200';
    if (c.includes('ANALYTICAL')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10 overflow-y-auto max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>Cognitive Diagnostic Battery</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Aptitude & Psychometric Diagnostic
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Calibrates your logical, quantitative, verbal, and analytical fitness against real tech benchmarks.
                </p>
              </div>

              {!result && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100/80 px-3.5 py-2 rounded-xl shrink-0">
                  <span>Answered:</span>
                  <span className="text-blue-600 font-black">{answeredCount}</span>
                  <span>/ {totalQuestions}</span>
                </div>
              )}
            </div>
          </div>

          {result ? (
            /* ======================================================== */
            /* RESULT SCREEN */
            /* ======================================================== */
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-8">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                  <Award className="h-8 w-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Diagnostic Successfully Completed!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                  Your cognitive psychometrics have been evaluated and synchronized with the recommendation engine.
                </p>
              </div>

              {/* Score Dial & Benchmark Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-6 text-center space-y-1">
                  <div className="text-5xl font-black text-blue-600 tracking-tight">{result.score}%</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Overall Aptitude Index</div>
                  <div className="text-xs text-slate-500">
                    {result.correctCount} of {result.totalQuestions} questions correct
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Performance Tier</span>
                  <div className="text-2xl font-extrabold text-emerald-700">
                    {result.score >= 80 ? 'Tier 1 • Exceptional' : result.score >= 60 ? 'Tier 2 • Proficient' : 'Tier 3 • Developing'}
                  </div>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Satisfies core cognitive requirements for advanced engineering and analytical pathways.
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Cognitive Dimensional Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.categoryScores || {}).map(([cat, stats]: [string, any]) => {
                    const catPct = stats.percentage ?? 0;
                    return (
                      <div
                        key={cat}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-2"
                      >
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-800">{cat.replace('_', ' ')}</span>
                          <span className="font-extrabold text-slate-900">{catPct}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA to View Recommendations */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setCurrentIndex(0);
                    setAnswers({});
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Retake Diagnostic
                </button>
                <Link
                  href="/recommendations"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>View Updated Career Matches</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : currentQuestion ? (
            /* ======================================================== */
            /* QUESTION SCREEN */
            /* ======================================================== */
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-8 sm:p-10 shadow-xs space-y-5 sm:space-y-6">
              {/* Question Navigator Pills & Category */}
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 touch-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {questions.map((q, idx) => {
                    const isQAnswered = answers[q.id] !== undefined;
                    const isQCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-8 w-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                          isQCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isQAnswered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={`Question ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <span
                  className={`self-start xs:self-auto text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${getCategoryColor(
                    currentQuestion.category
                  )}`}
                >
                  {currentQuestion.category?.replace('_', ' ')}
                </span>
              </div>

              {/* Question Statement */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {totalQuestions}
                </div>
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug break-words">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-2.5 sm:space-y-3 pt-1">
                {(currentQuestion.options as string[]).map((optionText, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between min-h-[48px] ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed break-words">{optionText}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="pt-5 sm:pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {currentIndex === totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !isAnswered}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 sm:px-6 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 transition-all hover:-translate-y-0.5 min-h-[44px]"
                  >
                    <span>{submitting ? 'Calculating Diagnostics...' : 'Submit Diagnostic'}</span>
                    <Sparkles className="h-4 w-4 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 sm:px-6 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all hover:-translate-y-0.5 min-h-[44px]"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="text-sm font-bold text-slate-800">No questions available in database</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
