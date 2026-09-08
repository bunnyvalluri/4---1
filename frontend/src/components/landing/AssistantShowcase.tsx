'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  Bot,
  User,
  CheckCircle2,
  Code,
  Terminal,
} from 'lucide-react';

export function AssistantShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Contextual Mentorship Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Contextual Mentorship
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Meet Your AI Career Assistant
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Unlike disconnected chat tools, your CareerAI assistant understands your verified skills, roadmap progress, and assessment benchmarks. Get specific, context-grounded guidance whenever you need it.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Profile-Aware Intelligence</div>
                  <div className="text-xs text-slate-500">Every response references your active milestones and skill gap telemetry.</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Technical Depth & Architecture</div>
                  <div className="text-xs text-slate-500">Deep dives into database indexing, system tradeoffs, and code reviews.</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Interview Simulation</div>
                  <div className="text-xs text-slate-500">Mock technical question drills and behavioral STAR storytelling reviews.</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Start a Consultation</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic Chat UI */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/40 space-y-4">
              
              {/* Chat Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
                    <Bot className="h-5 w-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">CareerAI Assistant</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>Synchronized with: Alex (Software Engineer Roadmap)</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Online • Telemetry Linked
                </span>
              </div>

              {/* Chat Dialog Messages */}
              <div className="space-y-4 py-2">
                
                {/* User Message Bubble */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-md rounded-2xl rounded-tr-xs bg-blue-600 text-white p-4 text-xs sm:text-sm leading-relaxed shadow-sm">
                    What should I learn next for a backend engineering career?
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-1 font-bold text-xs">
                    AL
                  </div>
                </div>

                {/* AI Assistant Message Bubble */}
                <div className="flex items-start gap-3 justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shrink-0 mt-1">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  
                  <div className="max-w-lg rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200/90 text-slate-800 p-4 sm:p-5 text-xs sm:text-sm space-y-3 shadow-2xs">
                    <p className="leading-relaxed">
                      Based on your verified skills in <strong>Python</strong> and <strong>React</strong>, plus your Month 2 roadmap milestones, here are the highest-impact focus areas for your backend trajectory:
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { num: '1', title: 'Advanced SQL & Schema Design', note: 'Indexing strategies, execution plans, and normalization.' },
                        { num: '2', title: 'RESTful API Design & Best Practices', note: 'Idempotency, status codes, and rate limiting.' },
                        { num: '3', title: 'Authentication & Session Security', note: 'JWT tokens, OAuth2 flows, and RBAC authorization.' },
                        { num: '4', title: 'Docker & Containerization', note: 'Multi-stage builds and isolated development environments.' },
                      ].map((item) => (
                        <div
                          key={item.num}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200/70 text-xs"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 font-bold shrink-0 text-[10px]">
                            {item.num}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900">{item.title}</span>
                            <span className="text-slate-500 block text-[11px]">{item.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/80">
                      <span className="text-[11px] text-slate-500">
                        Mapped to active roadmap Month 2.
                      </span>
                      <Link
                        href="/roadmap"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        <span>Start Learning</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                  </div>
                </div>

              </div>

              {/* Chat Input Preview */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-400">
                  Ask Aura about system design, code architecture, or career milestones...
                </div>
                <Link
                  href="/chat"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  Send
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
