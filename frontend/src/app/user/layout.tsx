'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { UserHeader } from '@/components/layout/UserHeader';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { useDashboardRealtime } from '@/lib/hooks/useDashboardRealtime';

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export default function UserPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Real-time telemetry, metrics, and notification center
  const {
    telemetryStatus,
    relativeTime,
    notifications,
    candidate,
    refresh,
    markNotificationRead,
  } = useDashboardRealtime();

  // Authentication & Authorization Guard
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        const data = await res.json();
        const user = data?.user;

        if (!user) {
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname || '/user/dashboard')}`;
          router.replace(loginUrl);
          return;
        }

        const role = String(user.role || '').toUpperCase();
        if (role === 'ADMIN') {
          router.replace('/admin/dashboard');
          return;
        }

        if (isMounted) {
          setCurrentUser(user);
          setAuthLoading(false);
        }
      } catch {
        if (isMounted) {
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname || '/user/dashboard')}`;
          router.replace(loginUrl);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  // Loading state during auth verification
  if (authLoading) {
    return (
      <div className="min-h-screen min-h-screen-dvh flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            Initializing CareerAI User Portal...
          </p>
        </div>
      </div>
    );
  }

  const displayName = candidate?.name || currentUser?.name || 'Candidate';
  const displayEmail = candidate?.email || currentUser?.email || '';

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex flex-col overflow-x-hidden text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Shared Sticky User Header */}
      <UserHeader
        userName={displayName}
        userEmail={displayEmail}
        telemetryStatus={telemetryStatus}
        lastUpdatedText={relativeTime}
        notifications={notifications}
        onRefresh={refresh}
        onMarkNotificationRead={markNotificationRead}
        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
      />

      {/* 2. Workspace Body: Persistent Sidebar + Common Content Container */}
      <div className="flex-1 flex flex-row w-full min-w-0">
        {/* Shared User Sidebar (Desktop persistent, Mobile slide-over drawer) */}
        <UserSidebar
          userName={displayName}
          userEmail={displayEmail}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Primary Page Canvas */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto">
          <main className="flex-1 w-full max-w-7xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6 lg:px-8 pb-32 lg:pb-12 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
