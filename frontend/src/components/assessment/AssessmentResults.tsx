'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Sparkles,
  ArrowRight,
  RotateCw,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Compass,
  BookOpen,
} from 'lucide-react';
import { AssessmentResult } from '@/lib/hooks/useAssessment';

interface AssessmentResultsProps {
  result: AssessmentResult;
  onRetake: () => void;
}

export function AssessmentResults({ result, onRetake }: AssessmentResultsProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const getTierBadge = (tier: string) => {
    if (tier.includes('Tier 1')) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        desc: 'Exceptional cognitive aptitude satisfying criteria for senior systems and specialized tracks.',
      };
    }
    if (tier.includes('Tier 2')) {
      return {
        badge: 'bg-blue-50 text-blue-800 border-blue-200',
        desc: 'Proficient technical and analytical reasoning ready for production-level software delivery.',
      };
    }
    return {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Developing foundational reasoning. Targeted practice recommended in the Roadmap.',
    };
  };

  const tierInfo = getTierBadge(result.performance_tier);

  return (
    <div className="space-y-8">
      {/* 1. Score Overview Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Award className="h-8 w-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>DIAGNOSTIC COMPLETED</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            YOUR CAREER ASSESSMENT RESULTS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Your reasoning and aptitude have been analyzed. These results have automatically synchronized with your Career Matches and Skill Intelligence.
          </p>
        </div>

        {/* Big Score Dials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-6 text-center space-y-1">
            <div className="text-5xl font-black text-blue-600 tracking-tight">{result.score}%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Overall Aptitude Index
            </div>
            <div className="text-xs text-slate-500">
              {result.correct_count} of {result.total_questions} questions answered correctly
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 flex flex-col justify-center items-center text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Performance Benchmark
            </span>
            <div className="text-2xl font-black text-emerald-700">{result.performance_tier}</div>
            <p className="text-[11px] text-slate-600 max-w-xs">{tierInfo.desc}</p>
          </div>
        </div>

        {/* 2. Cognitive Dimensional Performance */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              COGNITIVE DIMENSIONAL PERFORMANCE
            </h3>
            <span className="text-[11px] text-slate-400">Industry Benchmark: 70%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(result.category_scores || {}).map(([cat, stats]) => {
              const catPct = stats.percentage ?? 0;
              const isAboveBenchmark = catPct >= 70;

              return (
                <div
                  key={cat}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-2.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">{cat.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {stats.score}/{stats.total}
                      </span>
                      <span className="font-black text-slate-900">{catPct}%</span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isAboveBenchmark ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{isAboveBenchmark ? 'Above target benchmark' : 'Opportunity to strengthen'}</span>
                    <span className="font-semibold text-slate-700">
                      {isAboveBenchmark ? 'Strong' : 'Focus Area'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Strengths & Development Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {/* Strengths */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                IDENTIFIED STRENGTHS
              </h4>
            </div>

            {result.strengths.length > 0 ? (
              <ul className="space-y-2 text-xs text-emerald-950 font-semibold">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{str.replace('_', ' ')}: Verified strong benchmark</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600">
                Foundational cognitive competencies established. Keep practicing across sections.
              </p>
            )}
          </div>

          {/* Development Areas */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                AREAS TO DEVELOP
              </h4>
            </div>

            {result.weaknesses.length > 0 ? (
              <ul className="space-y-2 text-xs text-amber-950 font-semibold">
                {result.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
                    <span>{weak.replace('_', ' ')}: Practice recommended in Roadmap</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600">
                Zero critical cognitive weaknesses detected. You satisfied benchmarks across all dimensions!
              </p>
            )}
          </div>
        </div>

        {/* 4. HOW YOUR RESULTS AFFECT YOUR CAREER MATCHES */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              HOW YOUR RESULTS AFFECT YOUR CAREER MATCHES
            </h3>
            <span className="text-[11px] text-blue-600 font-bold">Synchronized in Real Time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {result.career_impacts.map((ci, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-slate-900">{ci.career_title}</div>
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {ci.match_percentage}%
                  </span>
                </div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  {ci.fit_level}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">{ci.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. CTAs to navigate across platform */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onRetake}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCw className="h-4 w-4" />
            <span>Retake Diagnostic</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/skills"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>View Skill Intelligence</span>
            </Link>

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
      </div>

      {/* 6. Question Review with Explanations (Unlocked after submission) */}
      {result.review_items && result.review_items.length > 0 && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              POST-ASSESSMENT LEARNING
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Detailed Question Review & Explanations
            </h3>
            <p className="text-xs text-slate-500">
              Inspect answer rationales and engineering concepts tested across all questions.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {result.review_items.map((item, idx) => {
              const isExpanded = expandedQuestion === item.question_id;
              const selectedLetter =
                item.selected_option !== undefined ? String.fromCharCode(65 + item.selected_option) : 'None';
              const correctLetter = String.fromCharCode(65 + item.correct_option);

              return (
                <div key={item.question_id} className="p-4 sm:p-5 space-y-3">
                  <div
                    onClick={() => setExpandedQuestion(isExpanded ? null : item.question_id)}
                    className="flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          item.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.is_correct ? '✓' : '✕'}
                      </span>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 uppercase">
                            {item.category?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Question {idx + 1}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.question}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.is_correct
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {item.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Explanation Drawer */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 space-y-3 text-xs animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 font-bold block mb-1">Your Answer:</span>
                          <span className="font-bold text-slate-900">
                            Option {selectedLetter}:{' '}
                            {item.selected_option !== undefined
                              ? item.options[item.selected_option]
                              : 'Not Answered'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-emerald-700 font-bold block mb-1">Correct Answer:</span>
                          <span className="font-black text-emerald-950">
                            Option {correctLetter}: {item.options[item.correct_option]}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900">
                          Explanation & Rationale
                        </div>
                        <p className="text-xs text-blue-950 leading-relaxed">{item.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
