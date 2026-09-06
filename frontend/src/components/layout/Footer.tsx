import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                Career<span className="text-blue-600">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              AI-powered personalized career guidance platform that understands your skills, interests, goals, and potential.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Full-Stack Platform Active</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/assessment" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Career Assessment
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Career Matches
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Skill Gap Analysis
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Personalized Roadmap
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Resume Intelligence
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-slate-600 hover:text-blue-600 transition-colors">
                  AI Career Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Careers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Top Career Paths</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/careers/ai-ml-engineer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  AI / ML Engineer
                </Link>
              </li>
              <li>
                <Link href="/careers/full-stack-developer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Full Stack Developer
                </Link>
              </li>
              <li>
                <Link href="/careers/data-scientist" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Data Scientist
                </Link>
              </li>
              <li>
                <Link href="/careers/cloud-devops-engineer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Cloud & DevOps Engineer
                </Link>
              </li>
              <li>
                <Link href="/careers/cybersecurity-analyst" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Cybersecurity Analyst
                </Link>
              </li>
              <li>
                <Link href="/careers/ui-ux-designer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  UI/UX Product Designer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: System Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Academic & Production</h4>
            <p className="text-sm text-slate-600 mb-3">
              Built as a comprehensive full-stack capstone and production SaaS demonstration with real database, auth, and AI.
            </p>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm space-y-1">
              <div className="font-semibold text-blue-600">Demo Admin Credentials:</div>
              <div className="font-mono text-slate-600">admin@careerai.dev</div>
              <div className="font-mono text-slate-600">Admin@123456</div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CareerAI Platform. All rights reserved.</p>
          <div className="flex gap-4 mt-3 sm:mt-0 font-medium">
            <span>Production Grade</span>
            <span>•</span>
            <span>Zero Dark Mode</span>
            <span>•</span>
            <span>Explainable AI Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
