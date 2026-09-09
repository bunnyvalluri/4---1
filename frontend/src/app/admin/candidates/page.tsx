'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
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
  X,
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

  // Add Candidate Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    targetCareer: 'Full Stack Developer',
    degree: '',
    college: '',
    location: '',
  });

  const fetchCandidates = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/candidates?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to load candidates');
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates(search);
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) {
      setAddError('Please enter candidate name, email, and password.');
      return;
    }

    try {
      setSubmittingAdd(true);
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create candidate.');
      }

      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        targetCareer: 'Full Stack Developer',
        degree: '',
        college: '',
        location: '',
      });
      setActionSuccess(`Candidate ${data.candidate.name} created successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
      fetchCandidates(search);
    } catch (err: any) {
      setAddError(err.message || 'Error creating candidate.');
    } finally {
      setSubmittingAdd(false);
    }
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Add Real Candidate</span>
          </button>
          <button
            onClick={() => fetchCandidates(search)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
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

      {/* Candidates Data Table & Mobile Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {/* Desktop Table View (>= lg: screens) */}
        <div className="hidden lg:block overflow-x-auto">
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
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">No candidates registered yet</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                        Genuine candidates will appear here automatically when they sign up on CareerAI. You can also register real candidates directly.
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add Real Candidate</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
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
                    <td className="px-4 py-4">
                      <span className="font-medium text-slate-800">{cand.target_career}</span>
                    </td>
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
                    <td className="px-4 py-4">
                      {cand.assessment_score !== null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cand.assessment_score}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Taken</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-700">{cand.top_match}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-medium text-slate-600">
                        {cand.resume_status}
                      </span>
                    </td>
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

        {/* Mobile / Tablet Cards View (< lg: screens) */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5" />
              </div>
              <p className="font-bold text-slate-800 text-xs">No registered candidates yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                Registered candidates will appear here automatically.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Add Real Candidate
              </button>
            </div>
          ) : (
            candidates.map((cand) => (
              <div key={cand.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {cand.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{cand.name}</p>
                      <p className="text-xs text-slate-500 truncate">{cand.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      cand.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {cand.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target</span>
                    <p className="font-semibold text-slate-800 truncate">{cand.target_career}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Match</span>
                    <p className="font-semibold text-blue-700 truncate">{cand.top_match}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Profile</span>
                    <p className="font-semibold text-slate-700">{cand.profile_completion}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Assessment</span>
                    <p className="font-semibold text-slate-700">
                      {cand.assessment_score !== null ? `${cand.assessment_score}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    href={`/admin/candidates/${cand.id}`}
                    className="touch-target flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(cand.id, cand.status)}
                    className={`touch-target flex items-center justify-center p-2.5 rounded-xl border transition-colors ${
                      cand.status === 'ACTIVE'
                        ? 'text-slate-500 hover:text-rose-600 bg-white border-slate-200'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-200'
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Register Real Candidate</h3>
                  <p className="text-[11px] text-slate-500">Create a candidate profile in the platform database</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {addError && (
              <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCandidate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Valluri"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="candidate@gmail.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Career / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer, Data Scientist"
                  value={addForm.targetCareer}
                  onChange={(e) => setAddForm({ ...addForm, targetCareer: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree (optional)</label>
                  <input
                    type="text"
                    placeholder="B.Tech, B.S."
                    value={addForm.degree}
                    onChange={(e) => setAddForm({ ...addForm, degree: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College (optional)</label>
                  <input
                    type="text"
                    placeholder="University"
                    value={addForm.college}
                    onChange={(e) => setAddForm({ ...addForm, college: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {submittingAdd ? 'Registering...' : 'Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
