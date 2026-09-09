'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, Users, Info, Loader2, RefreshCw } from 'lucide-react';

interface AdminUserRecord {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const adminList = (data.users || []).filter((u: any) => u.role === 'ADMIN');
      setUsers(adminList.length > 0 ? adminList : data.users || []);
    } catch (err: any) {
      console.error('Failed to fetch administrators:', err);
      setError('Unable to load administrator roster. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrator Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized personnel holding custom administrative roles for platform governance.
          </p>
        </div>
        <button
          onClick={fetchAdmins}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Security Provisioning Policy</p>
          <p className="text-blue-800 leading-relaxed">
            In accordance with zero-trust architectural guidelines, administrators cannot be self-promoted from candidate UI. Admin accounts are provisioned exclusively through authorized backend server claims.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-xs font-medium text-slate-500">Loading administrator directory...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">{error}</p>
            <button
              onClick={fetchAdmins}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No Administrators Found</p>
            <p className="text-xs text-slate-500">Run the backend claim utility to provision an administrator.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Administrator</th>
                    <th className="px-4 py-3.5">Claim Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            {(adm.name || adm.email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{adm.name || 'Admin User'}</p>
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
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          ACTIVE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-[11px]">
                        {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {users.map((adm) => (
                <div key={adm.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {(adm.name || adm.email || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{adm.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-500 truncate">{adm.email}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {adm.role}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Registered: {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
