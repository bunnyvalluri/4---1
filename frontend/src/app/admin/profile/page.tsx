'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, Clock, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AdminProfilePage() {
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((d) => setAdminUser(d?.user))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrator Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Identity, verified authorization claims, and security session parameters.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{adminUser?.name || 'Administrator'}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {adminUser?.role || 'ADMIN'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{adminUser?.email || 'admin@careerai.dev'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Authorization Mechanism</span>
            <p className="font-bold text-slate-900">Firebase Custom Claims (role: admin)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Session Security</span>
            <p className="font-bold text-slate-900">Cryptographically Signed HTTP-Only Cookie</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Account Status</span>
            <p className="font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Verified & Active
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Audit Trail</span>
            <p className="font-bold text-slate-900">Active Logging to Immutable Ledger</p>
          </div>
        </div>
      </div>
    </div>
  );
}
