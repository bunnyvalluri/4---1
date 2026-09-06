'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  BrainCircuit,
  Target,
  Map,
  FileCheck,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Award,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Briefcase,
  Layers,
  Star,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How does CareerAI calculate my career compatibility score?',
      a: 'CareerAI implements a transparent hybrid multi-criteria scoring system. It evaluates your verified technical skills against core and elective career requirements, aligns your psychometric aptitude benchmarks, verifies your educational and experience fit, matches your interests and target roles, and corroborates practical execution through resume analysis.',
    },
    {
      q: 'Is this just a simple ChatGPT wrapper?',
      a: 'No. CareerAI uses mathematical multi-attribute utility algorithms, real database models, psychometric cognitive assessment scoring, dynamic feature reweighting, and structured skill gap matrices. Generative AI is used selectively for qualitative narrative explanations and contextual mentoring, strictly grounded in your verified data.',
    },
    {
      q: 'Can I upload my existing resume?',
      a: 'Yes. You can upload any standard PDF or DOCX resume. Our parser extracts technical proficiencies, evaluates ATS format compliance, detects passive bullet points lacking quantifiable metrics, and highlights missing keywords for your target role.',
    },
    {
      q: 'How does the interactive roadmap work?',
      a: 'Once you choose a career, the platform generates an actionable 6-month curriculum broken down by month and milestones. You can check off tasks in real time, add personal notes, view curated study resources, and observe your completion telemetry update live on your dashboard.',
    },
    {
      q: 'What if I am transitioning from a non-computer science degree?',
      a: 'Our recommendation engine features cross-domain educational alignment. Careers like UI/UX Product Design, Product Management, and Data Analytics recognize degrees in Design, HCI, Business, and Mathematics with equal merit, avoiding generic CS bias.',
    },
  ];

  return (
    <div className="bg-white text-slate-900">
      {/* ======================================================== */}
      {/* HERO SECTION WITH DASHBOARD PREVIEW */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Next-Generation Career Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Discover the Career Path <br className="hidden sm:inline" />
              That&apos;s <span className="text-blue-600">Right for You</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              AI-powered career guidance that understands your skills, interests, goals, and potential.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <span>Start Your Career Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/recommendations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
              >
                <span>Explore Careers</span>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Free Comprehensive Diagnostic
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Transparent Math Scores
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Real-time Roadmaps
              </span>
            </div>
          </div>

          {/* Professional Dashboard Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xl subtle-blue-glow">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-6 space-y-6">
              {/* Preview Window Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-500">CareerAI Dashboard • Preview</span>
                </div>
                <div className="text-xs font-medium text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                  Active Session
                </div>
              </div>

              {/* Preview Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Top Match</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">Full Stack Developer</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">92% Compatibility</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Verified Skills</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">8 Competencies</div>
                  <div className="text-xs text-blue-600 font-semibold mt-0.5">4 Core Proficiencies</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Aptitude Fit</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">86% Index</div>
                  <div className="text-xs text-indigo-600 font-semibold mt-0.5">High Problem Solving</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Resume ATS Score</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">88 / 100</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">ATS Optimized</div>
                </div>
              </div>

              {/* Preview Roadmap & Skill Gap Bars */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Active 6-Month Roadmap</span>
                    <span className="text-blue-600 font-semibold">65% Completed</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-800">Month 1: Advanced TypeScript & Modern React</span>
                      <span className="text-emerald-600 font-semibold">Completed</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-blue-50/60 border border-blue-100">
                      <span className="font-medium text-slate-800">Month 2: PostgreSQL Schema & Prisma ORM</span>
                      <span className="text-blue-700 font-semibold">In Progress</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Priority Skill Gap Telemetry
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>TypeScript</span>
                        <span className="font-semibold text-slate-900">80% / 100%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full w-[80%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>PostgreSQL & Relational Data</span>
                        <span className="font-semibold text-slate-900">70% / 100%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full w-[70%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 1: HOW IT WORKS */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Methodology</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How CareerAI Works
            </h2>
            <p className="text-base text-slate-600">
              A 4-stage systematic pipeline that replaces guesswork with mathematical precision.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Comprehensive Profile</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide your education credentials, declared competencies, career goals, and upload your current resume.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Cognitive Assessment</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take an interactive diagnostic evaluating your problem solving, quantitative reasoning, and analytical speed.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700 font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Hybrid Match Scoring</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our recommendation engine calculates 7 transparent contributing factors and produces ranked career pathways.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Interactive Execution</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Follow your month-by-month roadmap, build recommended portfolio projects, and optimize your resume for ATS passes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: AI-POWERED CAREER MATCHING */}
      {/* ======================================================== */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Intelligent Matching</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Multi-Factor Compatibility Without Simplistic Shortcuts
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Traditional career quizzes rely on generic questionnaires. CareerAI computes true mathematical compatibility across verified skills, seniority calibrations, academic alignment, and cognitive psychometrics.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-semibold text-slate-900">Semantic Skill Transfer:</strong>
                    <p className="text-xs text-slate-600">Recognizes related proficiencies (e.g., PyTorch implies Machine Learning foundation).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-semibold text-slate-900">Cross-Domain Academic Evaluation:</strong>
                    <p className="text-xs text-slate-600">Properly values Design degrees for UI/UX and Statistics for Data Science.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-semibold text-slate-900">Confidence Scoring:</strong>
                    <p className="text-xs text-slate-600">Transparently reports data completeness so you know exactly how strong each match is.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-bold text-sm text-slate-900">Example Match Result</span>
                <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs font-bold">92% Match</span>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900">AI / Machine Learning Engineer</h4>
                  <p className="text-xs text-slate-500">Artificial Intelligence & Data • High Demand</p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Contributing Factor Attribution:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500">Skills Alignment:</span> <strong className="text-emerald-600">95%</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500">Cognitive Aptitude:</span> <strong className="text-blue-600">92%</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500">Education Match:</span> <strong className="text-blue-600">90%</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500">Experience Seniority:</span> <strong className="text-slate-700">85%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: SKILL-GAP ANALYSIS */}
      {/* ======================================================== */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Precision Diagnostics</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Interactive Skill-Gap Telemetry
          </h2>
          <p className="text-base text-slate-600">
            Know exactly what stands between you and your dream role before you ever apply.
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto px-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm font-bold text-slate-800">Target Role: Full Stack Software Engineer</span>
              <span className="text-xs text-slate-500">Requirement Benchmark: Level 4/5</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>TypeScript & Type Safety</span>
                  <span className="font-semibold text-emerald-600">Current: 5/5 • 100% Satisfied</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>React.js & State Management</span>
                  <span className="font-semibold text-emerald-600">Current: 4/5 • 100% Satisfied</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>PostgreSQL & Query Optimization</span>
                  <span className="font-semibold text-amber-600">Current: 2/5 • Moderate Gap</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[50%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Docker & Production CI/CD</span>
                  <span className="font-semibold text-red-600">Current: 0/5 • Critical Priority</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full w-[10%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: PERSONALIZED ROADMAP */}
      {/* ======================================================== */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Structured Curriculum</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                A Timeline-Based 6-Month Roadmap Tailored to Your Gaps
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Rather than an overwhelming list of courses, get a month-by-month structured curriculum. Check off tasks as you complete them, log notes, and watch your completion percentage synchronize in real-time.
              </p>
              <div className="pt-2">
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>Explore Interactive Roadmap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 uppercase tracking-wider">Month 1 • Fundamentals & Core Tech</span>
                  <span className="text-emerald-600 font-semibold">100% Done</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">Modern Architecture & State Management</div>
                <div className="text-xs text-slate-600">Hands-on interactive components, custom hooks, and unit testing suites.</div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 uppercase tracking-wider">Month 2 • Backend & Database Schema</span>
                  <span className="text-blue-600 font-semibold">Active Month</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">PostgreSQL Schema & Prisma ORM</div>
                <div className="text-xs text-slate-600">Indexing strategies, connection pooling, and REST API controllers.</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Month 3 • Cloud Deployment & CI/CD</span>
                  <span className="text-slate-400 font-semibold">Upcoming</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">Docker Packaging & Automated Pipelines</div>
                <div className="text-xs text-slate-600">Container orchestration, secrets management, and zero-downtime deployment.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: RESUME INTELLIGENCE */}
      {/* ======================================================== */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 order-2 lg:order-1">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-sm font-bold text-slate-900">ATS Resume Diagnostic</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Score: 88 / 100
                </span>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <strong className="text-slate-800 block mb-1">Detected Technical Proficiencies:</strong>
                  <div className="flex flex-wrap gap-1">
                    {['TypeScript', 'React.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Jest'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-slate-700">
                  <strong className="text-amber-800 block mb-0.5">Weak Bullet Point Rewrite:</strong>
                  <div className="line-through text-slate-400">&ldquo;Worked on API endpoints for users&rdquo;</div>
                  <div className="text-emerald-700 font-medium mt-1">
                    &ldquo;Architected RESTful endpoints handling 10,000+ daily active requests with sub-50ms latency.&rdquo;
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 order-1 lg:order-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Resume Optimization</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Resume Intelligence & ATS Screening
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Upload your resume in PDF or DOCX format. Our parser extracts technical keywords, identifies weak phrasing lacking quantifiable metrics, and tells you the exact keywords required by applicant tracking systems.
              </p>
              <div className="pt-2">
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Analyze Your Resume</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: AI CAREER ASSISTANT */}
      {/* ======================================================== */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Contextual Mentorship</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Meet Aura: Your AI Career Architect
          </h2>
          <p className="text-base text-slate-600">
            Aura has real-time access to your verified skills, aptitude scores, active roadmap, and resume analysis to provide precise, actionable technical mentorship.
          </p>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="text-xs font-bold text-blue-600 uppercase">Context Aware</div>
              <p className="text-xs text-slate-600">Understands your specific degree, completed milestones, and top-ranked career trajectory.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="text-xs font-bold text-blue-600 uppercase">Code & System Design</div>
              <p className="text-xs text-slate-600">Explains architecture trade-offs, code reviews, and mock technical interview questions.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="text-xs font-bold text-blue-600 uppercase">No Generic Fluff</div>
              <p className="text-xs text-slate-600">Every response directly references your active skill gaps and roadmap progress.</p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat with Aura Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 7: CAREER CATEGORIES */}
      {/* ======================================================== */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Domain Taxonomy</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Explore Tech Disciplines
            </h2>
            <p className="text-base text-slate-600">
              Benchmarked across 20+ specialized career paths with real market compensation and demand metrics.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Software Engineering', count: '6 Specialized Roles', desc: 'Full Stack, Backend, Frontend, Systems, Mobile, and QA automation.' },
              { title: 'Artificial Intelligence & Data', count: '4 Specialized Roles', desc: 'AI/ML Engineering, Data Science, Data Analytics, and Deep Learning.' },
              { title: 'Cloud & Infrastructure', count: '3 Specialized Roles', desc: 'DevOps, Site Reliability Engineering (SRE), and Cloud Architecture.' },
              { title: 'Security & Operations', count: '3 Specialized Roles', desc: 'Cybersecurity Analysis, SOC Defense, and Cryptographic Engineering.' },
              { title: 'Design & Product Management', count: '3 Specialized Roles', desc: 'UI/UX Product Design, User Research, and Technical Product Management.' },
              { title: 'Mobile & Emerging Tech', count: '3 Specialized Roles', desc: 'iOS, Android, React Native, and Flutter Cross-Platform Engineering.' },
            ].map((cat) => (
              <div key={cat.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 transition-all space-y-2">
                <span className="text-xs font-bold text-blue-600">{cat.count}</span>
                <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
                <p className="text-sm text-slate-600">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 8: PLATFORM STATISTICS */}
      {/* ======================================================== */}
      <section className="py-16 bg-blue-600 text-white border-b border-blue-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold">20+</div>
              <div className="text-blue-100 text-sm mt-1">Calibrated Careers</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold">100+</div>
              <div className="text-blue-100 text-sm mt-1">Skills In Catalog</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold">7</div>
              <div className="text-blue-100 text-sm mt-1">Scoring Dimensions</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold">100%</div>
              <div className="text-blue-100 text-sm mt-1">Light Theme Cleanliness</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 9: TESTIMONIALS */}
      {/* ======================================================== */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Proven Impact</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Trusted by Candidates & Engineers
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                &ldquo;The contributing factors breakdown showed me that while my React skills were strong, missing PostgreSQL was pulling down my Full Stack score. The 6-month roadmap helped me bridge the gap in 6 weeks!&rdquo;
              </p>
              <div className="border-t border-slate-200 pt-3 text-xs">
                <div className="font-bold text-slate-900">David Kumar</div>
                <div className="text-slate-500">Junior Frontend to Full Stack Transition</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                &ldquo;Coming from an HCI Design background, most tech guidance platforms told me I had to learn C++ or Java. CareerAI immediately highlighted UI/UX Product Design with a 92% match score.&rdquo;
              </p>
              <div className="border-t border-slate-200 pt-3 text-xs">
                <div className="font-bold text-slate-900">Sarah Jenkins</div>
                <div className="text-slate-500">B.Des Graduate & Product Designer</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                &ldquo;The resume analyzer rewrote 3 of my passive project bullet points into metric-backed achievements. My interview response rate doubled within 2 weeks.&rdquo;
              </p>
              <div className="border-t border-slate-200 pt-3 text-xs">
                <div className="font-bold text-slate-900">Carlos Mendez</div>
                <div className="text-slate-500">Cloud & DevOps Specialist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 10: FREQUENTLY ASKED QUESTIONS */}
      {/* ======================================================== */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Support & FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 11: FINAL HIGH-IMPACT CTA */}
      {/* ======================================================== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 p-8 sm:p-14 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Accelerate Your Career Trajectory?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
              Join candidates leveraging data-driven career matching, interactive skill roadmaps, and ATS resume intelligence.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 text-base font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-colors"
              >
                Get Started for Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl bg-blue-700/60 border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
