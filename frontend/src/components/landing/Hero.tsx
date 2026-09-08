'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Brain,
  Code2,
  Database,
  Terminal,
  Layers,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Check,
  User,
  LayoutGrid,
} from 'lucide-react';

export function Hero() {
  const [activeTab, setActiveTab] = useState<'student' | 'interface'>('student');

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-slate-200 bg-white">
      {/* Background ambient lighting - strictly light & purposeful */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-slate-50/20 to-white pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Hero Narrative */}
          <div className="space-y-7 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 tracking-wide uppercase shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>AI-POWERED CAREER GUIDANCE</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Discover the Career Path{' '}
              <br className="hidden sm:inline" />
              <span className="text-blue-600">That&apos;s Right for You.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              CareerAI analyzes your skills, interests, education, experience, and assessment results to provide personalized career recommendations and structured learning guidance.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all active:scale-[0.99]"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Small Trust Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                Personalized recommendations
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                Skill-gap analysis
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                AI-powered guidance
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual with Switcher */}
          <div className="w-full">
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
              
              {/* Card Switcher Header */}
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 border-b border-slate-100 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-1">
                    CareerAI <span className="hidden sm:inline">• Interactive Preview</span>
                  </span>
                </div>

                {/* Tab Pill Switcher: Student Story first, Product Preview next */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold self-stretch xs:self-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('student')}
                    className={`flex-1 xs:flex-none px-3 py-1.5 min-h-[32px] rounded-lg transition-all text-center cursor-pointer ${
                      activeTab === 'student'
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Student Story
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('interface')}
                    className={`flex-1 xs:flex-none px-3 py-1.5 min-h-[32px] rounded-lg transition-all text-center cursor-pointer ${
                      activeTab === 'interface'
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Product Preview
                  </button>
                </div>
              </div>

              {/* View 1: Real Product Preview */}
              {activeTab === 'interface' && (
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Top Match Bar */}
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0">
                        <img
                          src="/hero-student.jpg"
                          alt="Student Candidate"
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Career Match</div>
                        <div className="text-base sm:text-lg font-bold text-slate-900">Software Engineer</div>
                      </div>
                    </div>
                    <div className="text-left xs:text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        <TrendingUp className="h-3 w-3" />
                        92% compatibility
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">High Confidence Benchmark</div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Skills</span>
                      <span className="text-[11px] text-slate-400">4 Verified Proficiencies</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Python', 'React', 'SQL', 'Problem Solving'].map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      Strengths
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <span>Technical foundation</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <span>Analytical thinking</span>
                      </div>
                    </div>
                  </div>

                  {/* Skill gaps */}
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        Skill gaps
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium">To Reach 98%</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">System Design</span>
                        <span className="text-amber-700 font-semibold text-[11px]">Priority: High</span>
                      </div>
                      <div className="h-1.5 w-full bg-amber-200/60 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[45%]" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-medium text-slate-700">Cloud Fundamentals</span>
                        <span className="text-amber-700 font-semibold text-[11px]">Priority: Medium</span>
                      </div>
                      <div className="h-1.5 w-full bg-amber-200/60 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[30%]" />
                      </div>
                    </div>
                  </div>

                  {/* Recommended next step */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recommended next step</div>
                        <div className="text-xs font-semibold text-white">Build a full-stack project</div>
                      </div>
                    </div>
                    <Link
                      href="/projects"
                      className="shrink-0 text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 transition-colors min-h-[32px] self-start xs:self-auto"
                    >
                      <span>View Project</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* View 1 (Default): Student Experience Image */}
              {activeTab === 'student' && (
                <div className="relative p-3 sm:p-4 bg-slate-50/70 flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                    <img
                      src="/hero-student.jpg"
                      alt="CareerAI Student Experience"
                      className="w-full h-auto object-cover max-h-[380px] sm:max-h-[410px]"
                    />
                  </div>
                  
                  {/* Student Meta & Next Action */}
                  <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-2 pt-1">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Alex Morgan</div>
                      <div className="text-[11px] text-slate-500">CS Graduate • Full-Stack Engineer Track</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('interface')}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-2xs"
                    >
                      <span>Explore Product Preview</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
