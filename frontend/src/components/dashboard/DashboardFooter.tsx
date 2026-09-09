'use client';

import React from 'react';
import Link from 'next/link';

export function DashboardFooter() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 py-4 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-4 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="font-bold text-slate-700">CareerAI</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6 font-semibold" aria-label="Dashboard footer links">
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            Terms
          </Link>
          <Link href="/security" className="hover:text-blue-600 transition-colors">
            Security
          </Link>
          <Link href="/help" className="hover:text-blue-600 transition-colors">
            Help
          </Link>
        </nav>
      </div>
    </footer>
  );
}
