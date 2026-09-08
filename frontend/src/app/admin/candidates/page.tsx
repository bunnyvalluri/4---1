'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  UserX,
  UserCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';

interface CandidateItem {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  target_career: string;
  profile_completion: number;
  assessment_score: number | null;
  top_match: string;
  has_roadmap: boolean;
  resume_status: string;
  last_active: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export default function CandidatesManagementPage() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchCandidates = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/candidates?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to load candidates');
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates(search);
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c))
      );
      setActionSuccess(`Candidate account marked as ${newStatus}.`);
      setTimeout(() => setActionSuccess(null), 3500);

      await fetch(`/api/admin/candidates/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of registered platform candidates, aptitude records, and progress status.
          </p>
        </div>

        <button
          onClick={() => fetchCandidates(search)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name, email, or target career..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Candidates Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Target Career</th>
                <th className="px-4 py-3.5">Profile</th>
                <th className="px-4 py-3.5">Assessment</th>
                <th className="px-4 py-3.5">Top Match</th>
                <th className="px-4 py-3.5">Resume</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Candidate Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {cand.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{cand.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{cand.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Target Career */}
                    <td className="px-4 py-4">
                      <span className="font-medium text-slate-800">{cand.target_career}</span>
                    </td>

                    {/* Profile Completion */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${cand.profile_completion}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {cand.profile_completion}%
                        </span>
                      </div>
                    </td>

                    {/* Assessment */}
                    <td className="px-4 py-4">
                      {cand.assessment_score !== null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cand.assessment_score}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Taken</span>
                      )}
                    </td>

                    {/* Top Match */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-700">{cand.top_match}</span>
                    </td>

                    {/* Resume */}
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-medium text-slate-600">
                        {cand.resume_status}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          cand.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {cand.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/candidates/${cand.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                          title="View Candidate Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleStatusToggle(cand.id, cand.status)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            cand.status === 'ACTIVE'
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={cand.status === 'ACTIVE' ? 'Suspend Candidate' : 'Activate Candidate'}
                        >
                          {cand.status === 'ACTIVE' ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
