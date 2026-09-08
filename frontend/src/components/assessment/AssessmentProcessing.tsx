'use client';

import React from 'react';
import { Loader2, CheckCircle2, Circle, Sparkles, BrainCircuit } from 'lucide-react';

interface AssessmentProcessingProps {
  step: number;
}

export function AssessmentProcessing({ step }: AssessmentProcessingProps) {
  const stages = [
    { label: 'Validating answer telemetry & question integrity', key: 0 },
    { label: 'Scoring cognitive dimensional categories & aptitudes', key: 1 },
    { label: 'Extracting strengths and targeted development areas', key: 2 },
    { label: 'Calibrating career recommendation match vectors', key: 3 },
    { label: 'Synchronizing skill intelligence and personalized roadmap', key: 4 },
  ];

  return (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 max-w-lg w-full shadow-lg space-y-8 text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BrainCircuit className="h-10 w-10 animate-pulse" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Analyzing Your Diagnostic Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            CareerAI is calibrating your cognitive profile against real software engineering benchmarks and updating your career matches.
          </p>
        </div>

        {/* Multi-step progress checklist */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3">
          {stages.map((stg) => {
            const isFinished = step > stg.key;
            const isCurrent = step === stg.key;

            return (
              <div key={stg.key} className="flex items-center gap-3 text-xs">
                {isFinished ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                )}

                <span
                  className={`${
                    isFinished
                      ? 'text-slate-800 font-semibold'
                      : isCurrent
                      ? 'text-blue-700 font-extrabold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
