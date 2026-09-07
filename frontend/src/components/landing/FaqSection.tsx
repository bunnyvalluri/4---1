'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'What is CareerAI?',
    a: 'CareerAI is an AI-powered career guidance and intelligence platform. It helps candidates, students, and professionals discover optimal career paths, benchmark skill gaps, follow personalized learning roadmaps, scan resumes for ATS compliance, and consult an AI career mentor.',
  },
  {
    q: 'How are career recommendations generated?',
    a: 'Recommendations are generated using a multi-attribute utility algorithm. Rather than basic questionnaires, the system evaluates technical skills, aptitude diagnostic scores, educational degrees, work experience, and domain interests against calibrated industry role profiles.',
  },
  {
    q: 'What information does CareerAI use?',
    a: 'CareerAI uses your declared technical skills, academic qualifications, cognitive and problem-solving assessment results, career preferences, and optional resume text to compute compatibility scores and personalized roadmaps.',
  },
  {
    q: 'Can I change my recommended career?',
    a: 'Yes. While CareerAI provides ranked recommendations, you can freely explore and adopt any of the 20+ calibrated career paths in our directory. Your roadmap and skill-gap telemetry will instantly recalculate for your chosen target role.',
  },
  {
    q: 'How does the skill-gap analysis work?',
    a: 'The engine compares your verified proficiency in specific tools and concepts against the benchmark required for entry or mid-level industry roles. It isolates exact gaps (e.g. System Design or Cloud Fundamentals) and assigns priority levels to guide your study sequence.',
  },
  {
    q: 'Can I upload my resume?',
    a: 'Yes. You can upload any standard PDF or DOCX resume. CareerAI parses your technical keywords, evaluates ATS format compliance, detects passive bullet points lacking quantifiable results, and suggests metric-focused improvements.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. CareerAI adheres to strict enterprise privacy standards. Your uploaded resumes, diagnostic scores, and account details are encrypted in transit and at rest, and are never sold or shared with third-party advertisers.',
  },
  {
    q: 'Can I use CareerAI on mobile?',
    a: 'Yes. The entire CareerAI platform is fully responsive and optimized for mobile devices, tablets, and desktops alike, allowing you to review roadmaps, track milestones, and consult the AI assistant on any screen size.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Support & Clarity
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Everything you need to know about our methodology, recommendations, and platform capabilities.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-bold text-slate-900 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg leading-snug pr-4">
                    {faq.q}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ${isOpen ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
