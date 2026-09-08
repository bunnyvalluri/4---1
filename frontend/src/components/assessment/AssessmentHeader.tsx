'use client';

import React from 'react';
import { BrainCircuit, Clock, CheckCircle2, RotateCw, ArrowRight } from 'lucide-react';
import { AssessmentStage } from '@/lib/hooks/useAssessment';

interface AssessmentHeaderProps {
  stage: AssessmentStage;
  answeredCount: number;
  totalQuestions: number;
  onStartOrResume?: () => void;
  onRetake?: () => void;
}

export function AssessmentHeader({
  stage,
  answeredCount,
  totalQuestions,
  onStartOrResume,
  onRetake,
}: AssessmentHeaderProps) {
  const getStatusBadge = () => {
    switch (stage) {
      case 'in_progress':
      case 'review':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            In Progress
          </span>
        );
      case 'results':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Ready to Start
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
              <BrainCircuit className="h-3.5 w-3.5 text-indigo-600" />
              <span>CAREER DIAGNOSTIC</span>
            </div>
            {getStatusBadge()}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CAREER ASSESSMENT
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Measure your reasoning, problem-solving, aptitude, and career preferences to build a more accurate career profile and personalized roadmap.
          </p>
        </div>

        {/* Telemetry pill & Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>15–20 min</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1 text-slate-700 font-bold">
              <span>Answered:</span>
              <span className="text-blue-600 font-black">{answeredCount}</span>
              <span className="text-slate-400">/ {totalQuestions}</span>
            </div>
          </div>

          {stage === 'overview' && onStartOrResume && (
            <button
              type="button"
              onClick={onStartOrResume}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5"
            >
              <span>Start Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {stage === 'results' && onRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retake Diagnostic</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
