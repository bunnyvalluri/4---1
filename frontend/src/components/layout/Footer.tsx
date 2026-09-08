'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/onboarding');

  const isWorkspacePage =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/chat') ||
    pathname?.startsWith('/assessment') ||
    pathname?.startsWith('/recommendations') ||
    pathname?.startsWith('/skills') ||
    pathname?.startsWith('/roadmap') ||
    pathname?.startsWith('/resume') ||
    pathname?.startsWith('/projects') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/careers');

  if (isAuthPage || isWorkspacePage) return null;

  return (
    <footer id="resources" className="border-t border-slate-200 bg-slate-50/70 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Description (spans 2 columns on tablet/desktop) */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Career<span className="text-blue-600">AI</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              AI-powered career guidance platform delivering personalized recommendations, verified skill-gap analysis, interactive roadmaps, and resume intelligence.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Diagnostic Pipeline Active</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link href="/assessment" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Career Assessment
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Recommendations
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Skill Gap
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-slate-600 hover:text-blue-600 transition-colors">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/recommendations" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Career Guides
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Learning Resources
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-slate-600 hover:text-blue-600 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/chat" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#faq" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Security
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} CareerAI. All rights reserved.</p>
          <div className="flex items-center gap-3 font-medium text-[11px] text-slate-400">
            <span>Light Theme Cleanliness</span>
            <span>•</span>
            <span>Transparent Attribution</span>
            <span>•</span>
            <span>Zero Dark Mode Artifacts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
