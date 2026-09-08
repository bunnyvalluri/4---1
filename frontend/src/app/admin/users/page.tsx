'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, Key, Users, Info } from 'lucide-react';

export default function AdminUsersPage() {
  const adminUsers = [
    {
      id: 'adm-01',
      name: 'System Administrator',
      email: 'admin@careerai.dev',
      role: 'ADMIN',
      status: 'ACTIVE',
      last_active: 'Just now',
      provisioned_via: 'CLI Backend Tooling (scripts/set_admin_claim.py)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrator Roster</h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized personnel holding Firebase custom claims for platform administration.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Security Provisioning Policy</p>
          <p className="text-blue-800 leading-relaxed">
            In accordance with zero-trust architectural guidelines, administrators cannot be promoted from the candidate UI. Admin accounts are provisioned exclusively through authorized server-side processes using <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">uv run python scripts/set_admin_claim.py &lt;email&gt;</code>.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Administrator</th>
                <th className="px-4 py-3.5">Claim Role</th>
                <th className="px-4 py-3.5">Provisioning Method</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Last Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {adm.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{adm.name}</p>
                        <p className="text-[11px] text-slate-500">{adm.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {adm.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-slate-600 font-mono text-[11px]">{adm.provisioned_via}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {adm.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 text-[11px]">
                    {adm.last_active}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
