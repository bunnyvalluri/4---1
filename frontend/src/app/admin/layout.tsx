'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        const user = data?.user;
        if (!user) {
          router.push('/login?redirect=/admin/dashboard');
          return;
        }
        const role = String(user.role || '').toUpperCase();
        if (role !== 'ADMIN') {
          // Candidate user trying to access admin
          setForbidden(true);
          setTimeout(() => {
            router.push('/dashboard?denied=admin_access_forbidden');
          }, 1500);
          return;
        }
        setAdminUser(user);
        setLoading(false);
      })
      .catch(() => {
        router.push('/login?redirect=/admin/dashboard');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen min-h-screen-dvh flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold tracking-wide uppercase">Verifying Administrator Privileges...</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen min-h-screen-dvh flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">403 Forbidden: Administrator Privileges Required</h2>
          <p className="text-xs text-slate-600">
            Your authenticated account does not possess administrative authorization. Redirecting to Candidate Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Dedicated Admin Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        adminName={adminUser?.name || 'Administrator'}
        adminEmail={adminUser?.email || ''}
      />

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
          adminName={adminUser?.name || 'Administrator'}
          adminEmail={adminUser?.email || ''}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-32 lg:pb-28 max-w-7xl w-full mx-auto space-y-6 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>

      {/* Floating Pill Mobile Bottom Navigation */}
      <AdminMobileNav
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        adminName={adminUser?.name || 'Administrator'}
        adminEmail={adminUser?.email || ''}
      />
    </div>
  );
}
