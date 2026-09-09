'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PublicContact {
  support_email: string | null;
  contact_email: string | null;
}

export function DashboardFooter() {
  const [contact, setContact] = useState<PublicContact | null>(null);

  useEffect(() => {
    fetch('/api/v1/public/contact')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setContact(data))
      .catch(() => setContact(null));
  }, []);

  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 py-4 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-4 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="font-bold text-slate-700">CareerAI</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 font-semibold flex-wrap">
          {contact?.support_email ? (
            <a
              href={`mailto:${contact.support_email}`}
              className="text-slate-500 hover:text-blue-600 transition-colors"
            >
              Support: {contact.support_email}
            </a>
          ) : (
            <span className="text-slate-400 font-normal italic">Contact info configured via server</span>
          )}
          <nav className="flex items-center gap-4 sm:gap-6" aria-label="Dashboard footer links">
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
      </div>
    </footer>
  );
}
