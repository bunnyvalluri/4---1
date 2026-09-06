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
      <div className="min-h-screen bg-slate-50 p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const isAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
              <BrainCircuit className="h-4 w-4" />
              <span>PSYCHOMETRIC & COGNITIVE ASSESSMENT</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Aptitude & Diagnostic Evaluation
            </h1>
            <p className="text-xs text-slate-500">
              Calibrates your logical, quantitative, verbal, and analytical fitness against real tech benchmarks.
            </p>
          </div>

          {result ? (
            /* Result Screen */
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                  <Award className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Diagnostic Completed!</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your cognitive psychometrics have been evaluated and synchronized with the recommendation engine.
                </p>
              </div>

              {/* Score Dial */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6 text-center space-y-1">
                <div className="text-4xl font-extrabold text-blue-600">{result.score}%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Overall Aptitude Index</div>
                <div className="text-xs text-slate-500">
                  {result.correctCount} of {result.totalQuestions} questions correct
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cognitive Dimensional Performance
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(result.categoryScores || {}).map(([cat, stats]: [string, any]) => {
                    const catPct = stats.percentage ?? 0;
                    return (
                      <div key={cat} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800">{cat.replace('_', ' ')}</span>
                          <span className="font-bold text-slate-900">{catPct}%</span>
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
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setCurrentIndex(0);
                    setAnswers({});
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Retake Test
                </button>
                <Link
                  href="/recommendations"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>View Updated Career Recommendations</span>
                </Link>
              </div>
            </div>
          ) : currentQuestion ? (
            /* Question Screen */
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              {/* Progress & Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 uppercase tracking-wider">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                    Category: {currentQuestion.category?.replace('_', ' ')}
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-2.5 pt-2">
                {(currentQuestion.options as string[]).map((optionText, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{optionText}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {currentIndex === totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !isAnswered}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit & Calculate Scores'}</span>
                    <Sparkles className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <div className="text-sm font-bold text-slate-800">No questions found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
