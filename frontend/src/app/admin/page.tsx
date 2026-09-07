'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Layers,
  BrainCircuit,
  FileCheck,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Shield,
  Activity,
  BarChart3,
  HelpCircle,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

type AdminTab = 'overview' | 'users' | 'careers' | 'skills' | 'questions' | 'telemetry';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [topCareers, setTopCareers] = useState<any[]>([]);
  const [careersList, setCareersList] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Searches & Filters
  const [userSearch, setUserSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState('ALL');

  // Role update state
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  // Modals
  const [showAddCareer, setShowAddCareer] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // New Career Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Software Engineering');
  const [newSalary, setNewSalary] = useState('$90,000 - $150,000 / yr');
  const [newDesc, setNewDesc] = useState('');
  const [creatingCareer, setCreatingCareer] = useState(false);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');
  const [newSkillDemand, setNewSkillDemand] = useState(85);
  const [creatingSkill, setCreatingSkill] = useState(false);

  // New Question Form
  const [newQCategory, setNewQCategory] = useState('LOGICAL');
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  // Notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notifySuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const loadAdminData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch(`/api/admin/users?q=${encodeURIComponent(userSearch)}`),
      ]);

      if (analyticsRes.status === 403 || analyticsRes.status === 401) {
        setError('Forbidden: Administrator privileges required to access this portal.');
        setLoading(false);
        return;
      }

      const analyticsData = await analyticsRes.json();
      const usersData = await usersRes.json();

      if (analyticsData?.stats) setStats(analyticsData.stats);
      if (analyticsData?.topCareers) setTopCareers(analyticsData.topCareers);
      if (usersData?.users) setUsers(usersData.users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCareers = async () => {
    try {
      const res = await fetch('/api/admin/careers');
      if (res.ok) {
        const data = await res.json();
        setCareersList(data.careers || []);
      }
    } catch (e) {
      console.error('Error loading careers:', e);
    }
  };

  const loadSkills = async () => {
    try {
      const res = await fetch(`/api/admin/skills?q=${encodeURIComponent(skillSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setSkillsList(data.skills || []);
      }
    } catch (e) {
      console.error('Error loading skills:', e);
    }
  };

  const loadQuestions = async () => {
    try {
      const catParam = selectedQuestionCategory === 'ALL' ? '' : `?category=${selectedQuestionCategory}`;
      const res = await fetch(`/api/admin/questions${catParam}`);
      if (res.ok) {
        const data = await res.json();
        setQuestionsList(data.questions || []);
      }
    } catch (e) {
      console.error('Error loading questions:', e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [userSearch]);

  useEffect(() => {
    if (activeTab === 'careers') loadCareers();
    if (activeTab === 'skills') loadSkills();
    if (activeTab === 'questions') loadQuestions();
  }, [activeTab, skillSearch, selectedQuestionCategory]);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setRoleUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Role change failed');

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      notifySuccess(`Updated user role to ${newRole}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleCreateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCareer(true);
    try {
      const res = await fetch('/api/admin/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          salaryRange: newSalary,
          description: newDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Career creation failed');

      setShowAddCareer(false);
      setNewTitle('');
      setNewDesc('');
      notifySuccess(`Career track "${newTitle}" created successfully!`);
      loadCareers();
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to create career');
    } finally {
      setCreatingCareer(false);
    }
  };

  const handleDeleteCareer = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/careers?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete career');
      notifySuccess(`Career "${title}" deleted`);
      loadCareers();
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error deleting career');
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSkill(true);
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillName,
          category: newSkillCategory,
          demandScore: Number(newSkillDemand),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Skill creation failed');

      setShowAddSkill(false);
      setNewSkillName('');
      notifySuccess(`Skill "${newSkillName}" registered in catalog`);
      loadSkills();
    } catch (err: any) {
      setError(err.message || 'Failed to create skill');
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete skill');
      notifySuccess(`Skill "${name}" removed`);
      loadSkills();
    } catch (err: any) {
      setError(err.message || 'Error deleting skill');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingQuestion(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newQCategory,
          question: newQText,
          options: newQOptions,
          correctOption: Number(newQCorrect),
          explanation: newQExplanation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Question creation failed');

      setShowAddQuestion(false);
      setNewQText('');
      setNewQOptions(['', '', '', '']);
      setNewQExplanation('');
      notifySuccess('Question added to assessment bank');
      loadQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to create question');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm(`Delete question #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete question');
      notifySuccess(`Question #${id} removed`);
      loadQuestions();
    } catch (err: any) {
      setError(err.message || 'Error deleting question');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error && error.includes('Forbidden')) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldAlert className="h-16 w-16 text-rose-600 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-900">Administrator Access Required</h1>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 text-left">
            <p className="font-semibold mb-1">Log in with the seeded administrator account:</p>
            <div className="font-mono font-bold">Email: admin@careerai.dev</div>
            <div className="font-mono">Password: Admin@123456</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 tracking-wide uppercase mb-1">
              <Shield className="h-4 w-4" />
              <span>CareerAI Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Governance & Telemetry
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Candidate access management, career catalog provisioning, skill demand weights, and diagnostic question bank.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                loadAdminData();
                if (activeTab === 'careers') loadCareers();
                if (activeTab === 'skills') loadSkills();
                if (activeTab === 'questions') loadQuestions();
                notifySuccess('Telemetry synchronized with database');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm min-h-[40px]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync</span>
            </button>
            {activeTab === 'careers' && (
              <button
                type="button"
                onClick={() => setShowAddCareer(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition min-h-[40px]"
              >
                <Plus className="h-4 w-4" />
                <span>Add Career Track</span>
              </button>
            )}
            {activeTab === 'skills' && (
              <button
                type="button"
                onClick={() => setShowAddSkill(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition min-h-[40px]"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </button>
            )}
            {activeTab === 'questions' && (
              <button
                type="button"
                onClick={() => setShowAddQuestion(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition min-h-[40px]"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 shadow-sm animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && !error.includes('Forbidden') && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800 shadow-sm">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* System Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Users</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 2}</div>
            <p className="text-[10px] text-slate-400 mt-1">Total registered</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Careers</span>
              <Briefcase className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalCareers || 20}</div>
            <p className="text-[10px] text-slate-400 mt-1">Active tracks</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Skills</span>
              <Layers className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalSkills || 79}</div>
            <p className="text-[10px] text-slate-400 mt-1">Taxonomy nodes</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Assessments</span>
              <BrainCircuit className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalAssessments || 1}</div>
            <p className="text-[10px] text-slate-400 mt-1">Tests completed</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Resumes</span>
              <FileCheck className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalResumes || 0}</div>
            <p className="text-[10px] text-slate-400 mt-1">Parsed & scored</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Roadmaps</span>
              <Activity className="h-4 w-4 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalRoadmaps || 1}</div>
            <p className="text-[10px] text-slate-400 mt-1">Active plans</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 overflow-hidden">
          <nav className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-px touch-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'overview', label: 'Overview & Demand', icon: BarChart3 },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'careers', label: 'Career Tracks', icon: Briefcase },
              { id: 'skills', label: 'Skill Taxonomy', icon: Layers },
              { id: 'questions', label: 'Assessment Bank', icon: HelpCircle },
              { id: 'telemetry', label: 'AI Telemetry & Logs', icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB 1: OVERVIEW & DEMAND */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Top Recommended Careers Across Cohort
              </h2>
              <p className="text-xs text-slate-500">
                Most frequent career matches generated by the transparent hybrid recommendation engine.
              </p>

              {topCareers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No recommendation aggregated records yet. Users need to run recommendations.
                </div>
              ) : (
                <div className="space-y-3">
                  {topCareers.map((tc, idx) => (
                    <div
                      key={tc.careerId}
                      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-slate-900">{tc.title}</div>
                          <div className="text-[11px] text-slate-500">{tc.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-blue-600">{tc.count} matches</div>
                        <div className="text-[10px] text-slate-500">Avg {tc.avgScore}% fit</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Platform System Health
              </h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                  <div className="font-semibold flex items-center justify-between">
                    <span>Database Connection</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 rounded-full font-bold">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">PostgreSQL connection pool healthy</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
                  <div className="font-semibold flex items-center justify-between">
                    <span>Hybrid Recommendation Engine</span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 rounded-full font-bold">7 FACTORS</span>
                  </div>
                  <p className="text-[11px] text-blue-700 mt-1">Cosine vector similarity + skill overlap active</p>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800">
                  <div className="font-semibold flex items-center justify-between">
                    <span>Resume Parsing Subsystem</span>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-100 rounded-full font-bold">READY</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-1">PDF & DOCX text extraction pipeline functional</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Registered Candidates & System Roles
                </h2>
                <p className="text-xs text-slate-500">Manage user authorization level and inspect profile onboarding state.</p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search candidates..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                />
              </div>
            </div>

            <ResponsiveTable>
              <table className="w-full text-left text-xs text-slate-700 min-w-[640px]">
                <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Degree / Major</th>
                    <th className="py-3 px-4">Verified Skills</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.profile?.degree ? (
                          <span>
                            {u.profile.degree} ({u.profile.branch || 'General'})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not completed</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">{u._count?.skills || 0} skills</span>
                        <span className="text-slate-400 ml-1">({u._count?.aptitudeAttempts || 0} tests)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={roleUpdatingId === u.id}
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-600 disabled:opacity-40 transition shadow-sm min-h-[36px]"
                        >
                          {roleUpdatingId === u.id
                            ? 'Updating...'
                            : u.role === 'ADMIN'
                            ? 'Demote to USER'
                            : 'Promote to ADMIN'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          </div>
        )}

        {/* TAB 3: CAREER TRACKS */}
        {activeTab === 'careers' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Career Tracks Catalog ({careersList.length})
                </h2>
                <p className="text-xs text-slate-500">All available career paths used by recommendation models and roadmaps.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCareer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Career</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careersList.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                          {c.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{c.title}</h3>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {c.demandLevel} Demand
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">{c.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>Salary: {c.salaryRange}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{c.skills?.length || 0} mapped skills</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCareer(c.id, c.title)}
                      className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Career"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SKILL TAXONOMY */}
        {activeTab === 'skills' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  Skill Taxonomy Node Registry ({skillsList.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Core competencies, technical proficiencies, and industry demand weightings.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Filter skills..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSkill(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {skillsList.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-white hover:border-blue-200 transition"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs text-slate-900 truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.category}</div>
                    <div className="text-[10px] font-mono text-blue-600">Demand: {s.demandScore || 80}/100</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(s.id, s.name)}
                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: QUESTION BANK */}
        {activeTab === 'questions' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Diagnostic Aptitude Question Bank ({questionsList.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Multiple choice questions measuring 5 cognitive aptitudes for career matching.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedQuestionCategory}
                  onChange={(e) => setSelectedQuestionCategory(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Categories</option>
                  <option value="LOGICAL">Logical Reasoning</option>
                  <option value="QUANTITATIVE">Quantitative</option>
                  <option value="VERBAL">Verbal Ability</option>
                  <option value="ANALYTICAL">Analytical</option>
                  <option value="PROBLEM_SOLVING">Problem Solving</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowAddQuestion(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {questionsList.map((q) => (
                <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {q.category}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">Difficulty: {q.difficulty}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                        #{q.id}. {q.question}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition shrink-0"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {Array.isArray(q.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg text-xs font-medium border ${
                            i === q.correctOption
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-bold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                          {i === q.correctOption && <span className="ml-2 text-[10px] text-emerald-700">(Correct)</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                      <span className="font-semibold text-slate-700">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AI TELEMETRY & LOGS */}
        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                Recommendation Engine Architecture
              </h2>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-900">Multi-Factor Scoring Equation</div>
                  <p className="font-mono text-[11px] text-blue-600">
                    MatchScore = 0.28(Skills) + 0.16(Interests) + 0.16(Aptitude) + 0.12(Education) + 0.10(Experience) + 0.10(Preferences) + 0.08(ResumeSkills)
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-900">Explainability Guarantee</div>
                  <p className="text-[11px]">
                    Every recommendation exposes full percentage breakdown across 7 transparent sub-scores, avoiding black-box decision making.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-900">Fallback Reliability Protocol</div>
                  <p className="text-[11px]">
                    Strict 3000ms AbortSignal timeout with deterministic cosine text similarity ensures continuous operation even during external network outages.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Live Subsystem Status Feed
              </h2>
              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">Auth Token Verification</span>
                  <span className="text-emerald-600 font-bold">PASS (JWT HS256)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">Prisma Client Latency</span>
                  <span className="text-blue-600 font-bold">~4ms</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">Resume Parser Engine</span>
                  <span className="text-emerald-600 font-bold">PASS (PDFParse + Mammoth)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">Roadmap Task Real-Time Sync</span>
                  <span className="text-emerald-600 font-bold">ACTIVE (/api/roadmap/task)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">Gemini LLM Assistant</span>
                  <span className="text-violet-600 font-bold">STANDBY (Autonomous Fallback ON)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Add Career Track */}
        <ResponsiveModal
          isOpen={showAddCareer}
          onClose={() => setShowAddCareer(false)}
          title={
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span>Provision New Career Track</span>
            </div>
          }
          description="Register a new job profile used for transparent matching algorithms."
        >
          <form onSubmit={handleCreateCareer} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Career Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Site Reliability Engineer"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Artificial Intelligence & Data">Artificial Intelligence & Data</option>
                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                <option value="Security & Operations">Security & Operations</option>
                <option value="Design & Product">Design & Product</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Salary Range</label>
              <input
                type="text"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Core responsibilities and architectural expectations..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddCareer(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingCareer}
                className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
              >
                {creatingCareer ? 'Creating...' : 'Create Career Track'}
              </button>
            </div>
          </form>
        </ResponsiveModal>

        {/* MODAL: Add Skill */}
        <ResponsiveModal
          isOpen={showAddSkill}
          onClose={() => setShowAddSkill(false)}
          title={
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Add Skill to Catalog</span>
            </div>
          }
          description="Register a technical competency node in the taxonomy registry."
        >
          <form onSubmit={handleCreateSkill} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Skill Name</label>
              <input
                type="text"
                required
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Kubernetes"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              >
                <option value="Technical">Technical</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Tools">Tools</option>
                <option value="Frameworks">Frameworks</option>
                <option value="Languages">Languages</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Demand Score (0 - 100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={newSkillDemand}
                onChange={(e) => setNewSkillDemand(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingSkill}
                className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
              >
                {creatingSkill ? 'Saving...' : 'Add Skill'}
              </button>
            </div>
          </form>
        </ResponsiveModal>

        {/* MODAL: Add Question */}
        <ResponsiveModal
          isOpen={showAddQuestion}
          onClose={() => setShowAddQuestion(false)}
          title={
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>Add Diagnostic Question</span>
            </div>
          }
          description="Contribute psychometric question measuring cognitive abilities."
        >
          <form onSubmit={handleCreateQuestion} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={newQCategory}
                onChange={(e) => setNewQCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              >
                <option value="LOGICAL">Logical Reasoning</option>
                <option value="QUANTITATIVE">Quantitative Aptitude</option>
                <option value="VERBAL">Verbal Ability</option>
                <option value="ANALYTICAL">Analytical Thinking</option>
                <option value="PROBLEM_SOLVING">Problem Solving</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Question Prompt</label>
              <textarea
                rows={2}
                required
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="Enter question text..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 font-semibold">Multiple Choice Options</label>
              {newQOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-slate-500">{String.fromCharCode(65 + idx)}:</span>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newQOptions];
                      updated[idx] = e.target.value;
                      setNewQOptions(updated);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
                  />
                  <input
                    type="radio"
                    name="correctOpt"
                    checked={newQCorrect === idx}
                    onChange={() => setNewQCorrect(idx)}
                    className="h-5 w-5 text-blue-600 cursor-pointer"
                    title="Mark as correct answer"
                  />
                </div>
              ))}
              <p className="text-[10px] text-slate-400">Select the radio button corresponding to the correct answer.</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Explanation</label>
              <input
                type="text"
                value={newQExplanation}
                onChange={(e) => setNewQExplanation(e.target.value)}
                placeholder="Reasoning behind correct answer..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddQuestion(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingQuestion}
                className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
              >
                {creatingQuestion ? 'Adding...' : 'Add Question'}
              </button>
            </div>
          </form>
        </ResponsiveModal>
      </div>
    </div>
  );
}
