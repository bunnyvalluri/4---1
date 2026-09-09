'use client';

import React, { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardFooter } from './DashboardFooter';
import { NotificationItem } from '@/lib/hooks/useDashboardRealtime';

interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  telemetryStatus: 'Live' | 'Syncing...' | 'Offline' | 'Cached';
  lastUpdatedText: string;
  notifications: NotificationItem[];
  onRefresh: () => void;
  onMarkNotificationRead: (id: string) => void;
}

export function DashboardShell({
  children,
  userName = 'Candidate',
  userEmail = '',
  telemetryStatus,
  lastUpdatedText,
  notifications,
  onRefresh,
  onMarkNotificationRead,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex flex-col overflow-x-hidden text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Header */}
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        telemetryStatus={telemetryStatus}
        lastUpdatedText={lastUpdatedText}
        notifications={notifications}
        onRefresh={onRefresh}
        onMarkNotificationRead={onMarkNotificationRead}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main Workspace Body: Sidebar + Scrollable Content */}
      <div className="flex-1 flex flex-row w-full min-w-0">
        {/* Responsive Sidebar (Desktop persistent, Mobile slide-over drawer) */}
        <DashboardSidebar
          userName={userName}
          userEmail={userEmail}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Primary Content Canvas */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto">
          <main className="flex-1 w-full max-w-7xl mx-auto py-5 sm:py-7 lg:py-8 px-3 sm:px-6 lg:px-8 xl:px-10 pb-28 lg:pb-8 space-y-6">
            {children}
          </main>

          {/* Minimal Professional Footer */}
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
