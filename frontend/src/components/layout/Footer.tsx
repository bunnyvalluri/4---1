'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Mail, Phone, Globe } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface PublicContact {
  support_email: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company_website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
}

export function Footer() {
  const pathname = usePathname();
  const [contact, setContact] = useState<PublicContact | null>(null);

  useEffect(() => {
    fetch('/api/v1/public/contact')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setContact(data))
      .catch(() => setContact(null));
  }, []);

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
    pathname?.startsWith('/careers') ||
    pathname?.startsWith('/interview') ||
    pathname?.startsWith('/applications') ||
    pathname?.startsWith('/market') ||
    pathname?.startsWith('/trajectory') ||
    pathname?.startsWith('/mentors');

  if (isAuthPage || isWorkspacePage) return null;

  return (
    <footer id="resources" className="border-t border-slate-200 bg-slate-50/70 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Description (spans 2 columns on tablet/desktop) */}
          <div className="col-span-2 space-y-4">
            <BrandLogo href="/" size="md" />

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

          {/* Column 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Contact & Support
            </h4>
            {contact && (contact.support_email || contact.contact_email || contact.contact_phone || contact.github_url || contact.linkedin_url) ? (
              <ul className="space-y-2.5 text-xs">
                {contact.support_email && (
                  <li>
                    <a href={`mailto:${contact.support_email}`} className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{contact.support_email}</span>
                    </a>
                  </li>
                )}
                {contact.contact_phone && (
                  <li>
                    <a href={`tel:${contact.contact_phone}`} className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{contact.contact_phone}</span>
                    </a>
                  </li>
                )}
                {contact.company_website && (
                  <li>
                    <a href={contact.company_website} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <span>Website</span>
                    </a>
                  </li>
                )}
                {contact.github_url && (
                  <li>
                    <a href={contact.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 fill-current text-slate-400" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </a>
                  </li>
                )}
                {contact.linkedin_url && (
                  <li>
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 fill-current text-slate-400" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.88 0-1.6.72-1.6 1.6a1.6 1.6 0 1 0 3.2 0c0-.88-.72-1.6-1.6-1.6z"/>
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">Contact information unavailable</p>
            )}
          </div>

          {/* Column 5: Company & Legal */}
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
