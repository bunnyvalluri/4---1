import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Sparkles, BookOpen, Layers, CheckCircle2, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/70 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Career<span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Next-generation career intelligence platform unifying psychometrics, multi-factor career recommendation algorithms, and live learning roadmaps.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telemetry Operational</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/assessment" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Cognitive Assessment
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Ranked Career Matches
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Skill Gap Telemetry
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Interactive Roadmap
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Resume ATS Scanner
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-slate-600 hover:text-blue-600 transition-colors">
                  AI Career Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Pathways */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Featured Pathways</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/careers/ai-ml-engineer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  AI / Machine Learning Engineer
                </Link>
              </li>
              <li>
                <Link href="/careers/full-stack-developer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Full Stack Cloud Engineer
                </Link>
              </li>
              <li>
                <Link href="/careers/data-scientist" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Data Scientist & Analyst
                </Link>
              </li>
              <li>
                <Link href="/careers/cloud-devops-engineer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Cloud & DevOps Architect
                </Link>
              </li>
              <li>
                <Link href="/careers/ui-ux-designer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  UI/UX Product Designer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Production Sandbox</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Equipped with simulated Candidate and Administrator accounts for instant evaluation.
            </p>
            <div className="rounded-xl border border-slate-200/90 bg-white p-3 text-xs space-y-1 shadow-2xs">
              <div className="font-bold text-blue-600 text-[11px] uppercase tracking-wider">Demo Credentials</div>
              <div className="font-mono text-[11px] text-slate-700">user: alex@example.com</div>
              <div className="font-mono text-[11px] text-slate-700">admin: admin@careerai.dev</div>
              <div className="text-[10px] text-slate-400">Password: User@123456 / Admin@123456</div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 CareerAI Platform. Engineered for next-generation talent guidance.</p>
          <div className="flex items-center gap-3 font-medium text-[11px] text-slate-400">
            <span>Enterprise Privacy</span>
            <span>•</span>
            <span>Explainable Utility AI</span>
            <span>•</span>
            <span>WCAG Accessible</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
