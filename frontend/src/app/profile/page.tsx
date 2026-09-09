'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Heart,
  Target,
  FolderGit2,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Camera,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Check,
  X,
  Bot,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  useCareerProfile,
  EducationItem,
  ExperienceItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
} from '@/lib/hooks/useCareerProfile';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.66 1.66 0 1 0 0 3.32 1.66 1.66 0 0 0 0-3.32Z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function ProfilePage() {
  const {
    profile,
    activities,
    loading,
    error,
    syncStatus,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    recalculating,
    refetch,
    updatePersonalInfo,
    addEducation,
    updateEducation,
    deleteEducation,
    addSkill,
    updateSkill,
    deleteSkill,
    addExperience,
    updateExperience,
    deleteExperience,
    addProject,
    updateProject,
    deleteProject,
    addCertification,
    updateCertification,
    deleteCertification,
    updatePreferencesAndGoals,
    updateInterests,
    recalculateMatches,
    uploadAvatar,
  } = useCareerProfile();

  const [activeTab, setActiveTab] = useState<string>('personal');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form local state for Personal tab
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Modals for sub-entities
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [eduForm, setEduForm] = useState<EducationItem>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    currently_studying: false,
    grade: '',
    description: '',
  });

  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillForm, setSkillForm] = useState<{
    skill_name: string;
    category: string;
    proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    years_of_experience: number;
  }>({
    skill_name: '',
    category: 'TECHNICAL',
    proficiency: 'INTERMEDIATE',
    years_of_experience: 1.0,
  });

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [expForm, setExpForm] = useState<ExperienceItem>({
    company: '',
    role: '',
    employment_type: 'FULL_TIME',
    location: '',
    start_date: '',
    end_date: '',
    currently_working: false,
    description: '',
    technologies: [],
    achievements: [],
  });
  const [techInput, setTechInput] = useState('');

  const [projModalOpen, setProjModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<ProjectItem | null>(null);
  const [projForm, setProjForm] = useState<ProjectItem>({
    name: '',
    description: '',
    role: '',
    technologies: [],
    github_url: '',
    live_url: '',
    status: 'COMPLETED',
  });
  const [projTechInput, setProjTechInput] = useState('');

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState<CertificationItem>({
    name: '',
    issuer: '',
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: '',
  });

  // Preferences & Goals local state
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [workMode, setWorkMode] = useState<'REMOTE' | 'HYBRID' | 'ON_SITE'>('HYBRID');
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [goalTimeframe, setGoalTimeframe] = useState('12 months');
  const [additionalGoals, setAdditionalGoals] = useState<string[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');

  // Interests local state
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterestInput, setCustomInterestInput] = useState('');

  // Synchronize local form states with fetched profile
  useEffect(() => {
    if (!profile) return;
    setName(profile.personal.name || profile.name || '');
    setPhone(profile.personal.phone || '');
    setLocation(profile.personal.location || '');
    setHeadline(profile.personal.headline || '');
    setBio(profile.personal.bio || '');
    setLinkedinUrl(profile.personal.linkedin_url || '');
    setGithubUrl(profile.personal.github_url || '');
    setPortfolioUrl(profile.personal.portfolio_url || '');

    setTargetRoles(profile.preferences.target_roles || []);
    setWorkMode(profile.preferences.work_mode || 'HYBRID');
    setPreferredIndustries(profile.preferences.preferred_industries || []);
    setPrimaryGoal(profile.goals.primary_goal || '');
    setGoalTimeframe(profile.goals.goal_timeframe || '12 months');
    setAdditionalGoals(profile.goals.additional_goals || []);
    setInterests(profile.interests || []);
  }, [profile]);

  const handleSavePersonal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await updatePersonalInfo({
        name,
        phone,
        location,
        headline,
        bio,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
      });
      setSaveSuccessMsg('Personal information updated successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Error saving profile: ' + err.message);
    }
  };

  const handleSavePreferencesAndGoals = async () => {
    try {
      await updatePreferencesAndGoals(
        {
          target_roles: targetRoles,
          preferred_industries: preferredIndustries,
          work_mode: workMode,
          preferred_locations: ['Remote', 'Hybrid'],
          preferred_technologies: ['Python', 'FastAPI', 'Next.js'],
        },
        {
          primary_goal: primaryGoal,
          goal_timeframe: goalTimeframe,
          additional_goals: additionalGoals,
        }
      );
      setSaveSuccessMsg('Preferences & goals saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Error saving preferences: ' + err.message);
    }
  };

  const handleToggleInterest = async (item: string) => {
    const updated = interests.includes(item)
      ? interests.filter((i) => i !== item)
      : [...interests, item];
    setInterests(updated);
    await updateInterests(updated);
  };

  const handleAddCustomInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInterestInput.trim()) return;
    const clean = customInterestInput.trim();
    if (!interests.includes(clean)) {
      const updated = [...interests, clean];
      setInterests(updated);
      await updateInterests(updated);
    }
    setCustomInterestInput('');
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEdu && editingEdu.id) {
        await updateEducation(editingEdu.id, eduForm);
      } else {
        await addEducation(eduForm);
      }
      setEduModalOpen(false);
      setEditingEdu(null);
      setEduForm({
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        currently_studying: false,
        grade: '',
        description: '',
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSkill({
        skill_name: skillForm.skill_name,
        category: skillForm.category,
        proficiency: skillForm.proficiency,
        proficiency_numeric:
          skillForm.proficiency === 'EXPERT'
            ? 5
            : skillForm.proficiency === 'ADVANCED'
            ? 4
            : skillForm.proficiency === 'INTERMEDIATE'
            ? 3
            : 1,
        years_of_experience: skillForm.years_of_experience,
        verification_status: 'SELF_REPORTED',
      });
      setSkillModalOpen(false);
      setSkillForm({
        skill_name: '',
        category: 'TECHNICAL',
        proficiency: 'INTERMEDIATE',
        years_of_experience: 1.0,
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExp && editingExp.id) {
        await updateExperience(editingExp.id, expForm);
      } else {
        await addExperience(expForm);
      }
      setExpModalOpen(false);
      setEditingExp(null);
      setExpForm({
        company: '',
        role: '',
        employment_type: 'FULL_TIME',
        location: '',
        start_date: '',
        end_date: '',
        currently_working: false,
        description: '',
        technologies: [],
        achievements: [],
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProj && editingProj.id) {
        await updateProject(editingProj.id, projForm);
      } else {
        await addProject(projForm);
      }
      setProjModalOpen(false);
      setEditingProj(null);
      setProjForm({
        name: '',
        description: '',
        role: '',
        technologies: [],
        github_url: '',
        live_url: '',
        status: 'COMPLETED',
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCertification(certForm);
      setCertModalOpen(false);
      setCertForm({
        name: '',
        issuer: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: '',
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const commonInterestPresets = [
    'Artificial Intelligence',
    'Machine Learning',
    'Cloud Native Systems',
    'Full Stack Engineering',
    'Distributed Systems',
    'DevOps & CI/CD',
    'Cybersecurity',
    'Data Science & Analytics',
    'System Architecture',
    'API Engineering',
    'Microservices',
    'Open Source Software',
  ];

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold uppercase tracking-wider">Loading Career Identity Workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  const completionPct = profile?.completion.percentage || 0;
  const readiness = profile?.readiness;
  const insight = profile?.insight;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Left Navigation */}
      <Sidebar />

      {/* Main Container: 2-Column Responsive Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 p-4 sm:p-6 lg:p-8 gap-6 max-w-[1680px] mx-auto w-full">
        
        {/* ==================================================================== */}
        {/* 2. CENTER: MAIN PROFILE WORKSPACE */}
        {/* ==================================================================== */}
        <div className="flex-1 min-w-0 space-y-6">
          
          {/* Workspace Header */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-1">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span>Candidate Identity & Telemetry</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Career Profile Management
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage the core source of truth Aura uses to calibrate career recommendations, skill-gap analysis, and your learning roadmap.
                </p>
              </div>

              {/* Sync Status & Primary Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
                  {syncStatus === 'saving' ? (
                    <>
                      <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : syncStatus === 'error' ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      <span>Sync issue</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                      <span>Synced</span>
                    </>
                  )}
                </div>

                {activeTab === 'personal' && (
                  <button
                    type="button"
                    onClick={() => handleSavePersonal()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </button>
                )}
                {activeTab === 'preferences' && (
                  <button
                    type="button"
                    onClick={() => handleSavePreferencesAndGoals()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Preferences</span>
                  </button>
                )}
              </div>
            </div>

            {/* Success alert banner */}
            {saveSuccessMsg && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Downstream Recommendation Invalidation Banner */}
            {readiness?.is_stale && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50/80 border border-amber-200 rounded-xl gap-3">
                <div className="flex items-start gap-3 text-xs text-amber-900">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Career Recommendations Need Recalculation</p>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      {readiness.stale_reason || 'Your profile was updated. Re-run multi-factor matching to refresh career fit scores.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => recalculateMatches()}
                  disabled={recalculating}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                  <span>{recalculating ? 'Recalculating...' : 'Recalculate Matches'}</span>
                </button>
              </div>
            )}

            {/* 8-Tab Responsive Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 text-xs font-bold scrollbar-none">
              {[
                { id: 'personal', name: 'Personal', icon: User },
                { id: 'education', name: 'Education', icon: GraduationCap, count: profile?.education.length },
                { id: 'skills', name: 'Skills Matrix', icon: Layers, count: profile?.skills.length },
                { id: 'experience', name: 'Experience', icon: Briefcase, count: profile?.experience.length },
                { id: 'projects', name: 'Projects', icon: FolderGit2, count: profile?.projects.length },
                { id: 'certifications', name: 'Certifications', icon: Award, count: profile?.certifications.length },
                { id: 'interests', name: 'Interests', icon: Heart, count: interests.length },
                { id: 'preferences', name: 'Preferences & Goals', icon: Target },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.name}</span>
                    {typeof tab.count === 'number' && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* TAB 1: PERSONAL INFORMATION */}
          {/* ==================================================================== */}
          {activeTab === 'personal' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Identity & Contact</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your professional headline, contact details, and verified online portfolio links.
                  </p>
                </div>
              </div>

              {/* Avatar section */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="relative group">
                  <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    {profile?.personal.avatar_url ? (
                      <img src={profile.personal.avatar_url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{(name || 'C').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAvatarModalOpen(true)}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition cursor-pointer"
                    title="Change photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">{name || 'Candidate Name'}</p>
                  <p className="text-[11px] text-slate-500">{profile?.email}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAvatarModalOpen(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Change Photo
                    </button>
                    {profile?.personal.avatar_url && (
                      <>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => uploadAvatar('')}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Fields Grid */}
              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-[10px] text-slate-400 font-normal">(Controlled by Firebase Auth)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={profile?.email || ''}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="San Francisco, CA / Remote"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Headline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aspiring AI & Machine Learning Engineer | Python | FastAPI | Docker"
                    value={headline}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    maxLength={160}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Appears directly under your identity across AI recommendations and mentor sessions.</span>
                    <span>{headline.length} / 160</span>
                  </div>
                </div>

                {/* Professional Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe your career background, foundational engineering experience, and technical specializations..."
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    maxLength={1000}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-y"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Keep employers and recommendation models informed about your core domain goals.</span>
                    <span>{bio.length} / 1000</span>
                  </div>
                </div>

                {/* Online Profiles */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Online Presence & Portfolios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                        <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" /> LinkedIn URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => {
                          setLinkedinUrl(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                        <GithubIcon className="h-3.5 w-3.5 text-slate-800" /> GitHub URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={githubUrl}
                        onChange={(e) => {
                          setGithubUrl(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-indigo-600" /> Portfolio Website
                      </label>
                      <input
                        type="url"
                        placeholder="https://myportfolio.dev"
                        value={portfolioUrl}
                        onChange={(e) => {
                          setPortfolioUrl(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Save Personal Information
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: EDUCATION */}
          {/* ==================================================================== */}
          {activeTab === 'education' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Academic Background</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Degrees, universities, fields of study, and academic achievements.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEdu(null);
                    setEduForm({
                      institution: '',
                      degree: '',
                      field_of_study: '',
                      start_date: '',
                      end_date: '',
                      currently_studying: false,
                      grade: '',
                      description: '',
                    });
                    setEduModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {profile?.education.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <GraduationCap className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Education Details Added</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add your university or degree to verify your academic eligibility for specialized roles.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {profile?.education.map((edu) => (
                    <div key={edu.id} className="py-4 flex items-start justify-between gap-4 group">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                          <p className="text-xs font-semibold text-slate-700">{edu.institution}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            {edu.field_of_study && <span>{edu.field_of_study}</span>}
                            <span>•</span>
                            <span>{edu.start_date || 'Year'} — {edu.currently_studying ? 'Present (In Progress)' : edu.end_date || 'Graduation'}</span>
                            {edu.grade && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-emerald-700">GPA / Grade: {edu.grade}</span>
                              </>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{edu.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEdu(edu);
                            setEduForm(edu);
                            setEduModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => edu.id && deleteEducation(edu.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: SKILLS MATRIX */}
          {/* ==================================================================== */}
          {activeTab === 'skills' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Skills Matrix & Verification</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Catalog of verified and self-reported skills feeding the recommendation engine.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSkillModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>

              {profile?.skills.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <Layers className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Skills Added</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add programming languages, frameworks, databases, and cloud competencies to unlock career recommendations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile?.skills.map((skill) => {
                    const profBadgeColor =
                      skill.proficiency === 'EXPERT'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : skill.proficiency === 'ADVANCED'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : skill.proficiency === 'INTERMEDIATE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200';

                    const isVerified =
                      skill.verification_status === 'VERIFIED' ||
                      skill.verification_status === 'ASSESSMENT_BASED';

                    return (
                      <div
                        key={skill.id || skill.skill_name}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">{skill.skill_name}</h3>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                              {skill.category}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => skill.id && deleteSkill(skill.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${profBadgeColor}`}>
                            {skill.proficiency}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {skill.years_of_experience} {skill.years_of_experience === 1 ? 'yr' : 'yrs'} exp
                          </span>
                        </div>

                        {/* Verification badge */}
                        <div className="pt-1 flex items-center gap-1.5 text-[10px]">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/80">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              <span>Verified Evidence</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                              <span>Self-reported</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 4: EXPERIENCE */}
          {/* ==================================================================== */}
          {activeTab === 'experience' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Professional Experience</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Internships, full-time positions, freelance deliverables, and technical roles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExp(null);
                    setExpForm({
                      company: '',
                      role: '',
                      employment_type: 'FULL_TIME',
                      location: '',
                      start_date: '',
                      end_date: '',
                      currently_working: false,
                      description: '',
                      technologies: [],
                      achievements: [],
                    });
                    setExpModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {profile?.experience.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <Briefcase className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Experience Added</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Highlight internships, developer apprenticeships, or research positions to calculate seniority matches.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile?.experience.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-3 group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                            <p className="text-xs font-semibold text-slate-700">{exp.company}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                              <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
                                {exp.employment_type.replace('_', ' ')}
                              </span>
                              <span>•</span>
                              <span>{exp.start_date || 'Start'} — {exp.currently_working ? 'Present' : exp.end_date || 'End'}</span>
                              {exp.location && (
                                <>
                                  <span>•</span>
                                  <span>{exp.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExp(exp);
                              setExpForm(exp);
                              setExpModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => exp.id && deleteExperience(exp.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {exp.description && (
                        <p className="text-xs text-slate-600 leading-relaxed pl-12">{exp.description}</p>
                      )}

                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pl-12">
                          {exp.technologies.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 5: PROJECTS */}
          {/* ==================================================================== */}
          {activeTab === 'projects' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Project Portfolio & Evidence</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Production code deliverables, open-source repositories, and applied projects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProj(null);
                    setProjForm({
                      name: '',
                      description: '',
                      role: '',
                      technologies: [],
                      github_url: '',
                      live_url: '',
                      status: 'COMPLETED',
                    });
                    setProjModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {profile?.projects.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <FolderGit2 className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Projects Added</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Showcase tangible engineering projects to provide evidence for skill proficiency.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                              {proj.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => proj.id && deleteProject(proj.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {proj.description && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{proj.description}</p>
                        )}

                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {proj.technologies.map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {proj.github_url && (
                            <a
                              href={proj.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600"
                            >
                              <GithubIcon className="h-3 w-3" /> GitHub
                            </a>
                          )}
                          {proj.live_url && (
                            <a
                              href={proj.live_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> Live App
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 6: CERTIFICATIONS */}
          {/* ==================================================================== */}
          {activeTab === 'certifications' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Licenses & Certifications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Industry certifications, cloud accreditations, and technical certificates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCertModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Certification</span>
                </button>
              </div>

              {profile?.certifications.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <Award className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Certifications Added</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add verified AWS, Google Cloud, Azure, or Kubernetes credentials to boost your career readiness rating.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {profile?.certifications.map((cert) => (
                    <div key={cert.id} className="py-3.5 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{cert.name}</h3>
                          <p className="text-[11px] text-slate-600">{cert.issuer}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            {cert.issue_date && <span>Issued: {cert.issue_date}</span>}
                            {cert.credential_id && <span>• ID: {cert.credential_id}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cert.credential_url && (
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            Verify ↗
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => cert.id && deleteCertification(cert.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 7: INTERESTS */}
          {/* ==================================================================== */}
          {activeTab === 'interests' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base font-bold text-slate-900">Career & Technical Interests</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select key interest domains to help Aura calibrate relevant career pathways and project recommendations.
                </p>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Engineering Domains</span>
                <div className="flex flex-wrap gap-2">
                  {commonInterestPresets.map((domain) => {
                    const isSelected = interests.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => handleToggleInterest(domain)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {domain}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom interest tag adder */}
              <form onSubmit={handleAddCustomInterest} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom domain (e.g. MLOps, Rust, WebAssembly)..."
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={!customInterestInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                >
                  Add Interest
                </button>
              </form>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 8: PREFERENCES & GOALS */}
          {/* ==================================================================== */}
          {activeTab === 'preferences' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base font-bold text-slate-900">Career Preferences & Objectives</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define your target career roles, working mode, and primary 12-month development goals.
                </p>
              </div>

              {/* Target Roles Tag Builder */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Target Career Roles</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {targetRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => setTargetRoles(targetRoles.filter((r) => r !== role))}
                        className="hover:text-blue-900 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add target role (e.g. AI/ML Engineer, Full Stack Architect)..."
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (targetRoleInput.trim() && !targetRoles.includes(targetRoleInput.trim())) {
                          setTargetRoles([...targetRoles, targetRoleInput.trim()]);
                          setTargetRoleInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (targetRoleInput.trim() && !targetRoles.includes(targetRoleInput.trim())) {
                        setTargetRoles([...targetRoles, targetRoleInput.trim()]);
                        setTargetRoleInput('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add Role
                  </button>
                </div>
              </div>

              {/* Work Mode Toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Preferred Work Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'REMOTE', label: 'Remote', desc: 'Work from anywhere' },
                    { id: 'HYBRID', label: 'Hybrid', desc: 'Office + Remote blend' },
                    { id: 'ON_SITE', label: 'On-Site', desc: 'Company office location' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setWorkMode(mode.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        workMode === mode.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold block">{mode.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary 12-Month Career Goal */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Primary Career Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Master applied machine learning and secure an AI Engineer role at a growth-stage company."
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              {/* Additional Milestone Goals */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Key Milestone Objectives</label>
                <div className="space-y-2">
                  {additionalGoals.map((g, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-slate-800 font-medium">🎯 {g}</span>
                      <button
                        type="button"
                        onClick={() => setAdditionalGoals(additionalGoals.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add milestone objective (e.g. Deploy 2 production ML models to Cloud)..."
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newGoalInput.trim()) {
                        setAdditionalGoals([...additionalGoals, newGoalInput.trim()]);
                        setNewGoalInput('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSavePreferencesAndGoals}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Save Preferences & Objectives
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ==================================================================== */}
        {/* 3. RIGHT: PROFILE INTELLIGENCE SIDEBAR */}
        {/* ==================================================================== */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5">
          
          {/* Card 1: Weighted Profile Completion */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Profile Completion</span>
              <span className="text-base font-extrabold text-blue-600">{completionPct}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            {profile?.completion.missing_sections && profile.completion.missing_sections.length > 0 ? (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  {profile.completion.missing_sections.length} section(s) need attention:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.completion.missing_sections.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        if (sec === 'Personal Information') setActiveTab('personal');
                        else if (sec === 'Education') setActiveTab('education');
                        else if (sec === 'Skills Matrix') setActiveTab('skills');
                        else if (sec === 'Experience') setActiveTab('experience');
                        else if (sec === 'Projects') setActiveTab('projects');
                        else if (sec === 'Career Preferences') setActiveTab('preferences');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                    >
                      + Complete {sec}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
                <span>All profile sections completed!</span>
              </div>
            )}
          </div>

          {/* Card 2: Career Readiness Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Career Profile Status</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                Live Telemetry
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Career:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px] text-right">
                  {readiness?.target_career || 'Software Engineer'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Career Match:</span>
                <span className="font-bold text-blue-600">
                  {readiness?.career_match_score ? `${readiness.career_match_score}%` : 'Not evaluated yet'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Verified Skills:</span>
                <span className="font-bold text-emerald-700">
                  {readiness?.verified_skills_count || 0} / {readiness?.total_skills_count || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Priority Skill Gaps:</span>
                <span className="font-bold text-amber-700">
                  {readiness?.priority_gaps_count || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Roadmap Progress:</span>
                <span className="font-bold text-slate-800">
                  {readiness?.roadmap_progress_pct ? `${readiness.roadmap_progress_pct}%` : 'Not available yet'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Resume ATS Score:</span>
                <span className="font-bold text-slate-800">
                  {readiness?.resume_ats_score ? `${readiness.resume_ats_score} / 100` : 'Not uploaded yet'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Aura AI Profile Insight */}
          {insight && (
            <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border border-blue-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <div className="p-1 rounded-lg bg-blue-600 text-white shadow-2xs">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <span>Aura Profile Insight</span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">{insight.headline}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{insight.body}</p>

              {insight.action_label && insight.action_route && (
                <Link
                  href={insight.action_route}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline pt-1"
                >
                  <span>{insight.action_label}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}

          {/* Card 4: Profile Data Quality Audit */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Profile Data Quality</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                profile?.completion.data_quality_status === 'Good'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {profile?.completion.data_quality_status || 'Good'}
              </span>
            </div>

            {profile?.completion.data_quality_issues && profile.completion.data_quality_issues.length > 0 ? (
              <div className="space-y-1.5 text-xs text-slate-600">
                {profile.completion.data_quality_issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                All mandatory quality parameters satisfied. Your profile contains valid evidence for AI matching.
              </p>
            )}
          </div>

          {/* Card 5: Recent Profile Activity Audit Log */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Recent Profile Activity</span>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400">No recent updates recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="py-2.5 space-y-0.5">
                    <p className="font-semibold text-slate-800 text-[11px]">{act.description}</p>
                    <span className="text-[10px] text-slate-400">
                      {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODALS (EDUCATION, SKILLS, EXPERIENCE, PROJECTS, CERTIFICATIONS, AVATAR) */}
      {/* ==================================================================== */}

      {/* Education Modal */}
      {eduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEdu ? 'Edit Academic Background' : 'Add Academic Background'}
              </h3>
              <button type="button" onClick={() => setEduModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveEducation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution / University</label>
                <input
                  type="text"
                  required
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Degree</label>
                  <input
                    type="text"
                    required
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    placeholder="e.g. Bachelor of Technology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={eduForm.field_of_study || ''}
                    onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Year</label>
                  <input
                    type="text"
                    value={eduForm.start_date || ''}
                    onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })}
                    placeholder="2022"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Year / Expected</label>
                  <input
                    type="text"
                    disabled={eduForm.currently_studying}
                    value={eduForm.end_date || ''}
                    onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="curr_edu"
                  checked={eduForm.currently_studying}
                  onChange={(e) => setEduForm({ ...eduForm, currently_studying: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <label htmlFor="curr_edu" className="font-semibold text-slate-700">Currently studying here</label>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">GPA / Score (Optional)</label>
                <input
                  type="text"
                  value={eduForm.grade || ''}
                  onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                  placeholder="e.g. 3.8 / 4.0 or 8.7 CGPA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEduModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Save Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Modal */}
      {skillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Skill to Catalog</h3>
              <button type="button" onClick={() => setSkillModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveSkill} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillForm.skill_name}
                  onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })}
                  placeholder="e.g. Python, Docker, PyTorch, SQL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white"
                >
                  <option value="TECHNICAL">TECHNICAL (Languages, Core)</option>
                  <option value="FRAMEWORK">FRAMEWORK (React, FastAPI, Django)</option>
                  <option value="CLOUD">CLOUD (AWS, GCP, Azure)</option>
                  <option value="DATABASE">DATABASE (PostgreSQL, Redis, Mongo)</option>
                  <option value="TOOL">TOOL (Git, Docker, Kubernetes)</option>
                  <option value="SOFT">SOFT (Leadership, Communication)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Proficiency Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSkillForm({ ...skillForm, proficiency: lvl })}
                      className={`p-2 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
                        skillForm.proficiency === lvl
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Years of Practical Experience</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  value={skillForm.years_of_experience}
                  onChange={(e) => setSkillForm({ ...skillForm, years_of_experience: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setSkillModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Add Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingExp ? 'Edit Experience' : 'Add Professional Experience'}
              </h3>
              <button type="button" onClick={() => setExpModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveExperience} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    placeholder="e.g. OpenAI / Google"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    required
                    value={expForm.role}
                    onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                    placeholder="e.g. ML Engineering Intern"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={expForm.employment_type}
                    onChange={(e) => setExpForm({ ...expForm, employment_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white"
                  >
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={expForm.location || ''}
                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                    placeholder="San Francisco, CA / Remote"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={expForm.start_date || ''}
                    onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                    placeholder="Jan 2024"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    disabled={expForm.currently_working}
                    value={expForm.end_date || ''}
                    onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
                    placeholder="Aug 2024"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Deliverables</label>
                <textarea
                  rows={3}
                  value={expForm.description || ''}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Architected distributed data pipelines; optimized latency by 40%..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 resize-y"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Technologies Used (Comma-separated)</label>
                <input
                  type="text"
                  value={expForm.technologies.join(', ')}
                  onChange={(e) => setExpForm({ ...expForm, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Python, Docker, FastAPI, PostgreSQL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setExpModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {projModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProj ? 'Edit Project' : 'Add Portfolio Project'}
              </h3>
              <button type="button" onClick={() => setProjModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projForm.name}
                  onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
                  placeholder="e.g. Distributed ML Training Platform"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Description</label>
                <textarea
                  rows={3}
                  value={projForm.description || ''}
                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                  placeholder="Built an autonomous pipeline deploying PyTorch models to Kubernetes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={projForm.github_url || ''}
                    onChange={(e) => setProjForm({ ...projForm, github_url: e.target.value })}
                    placeholder="https://github.com/user/project"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={projForm.live_url || ''}
                    onChange={(e) => setProjForm({ ...projForm, live_url: e.target.value })}
                    placeholder="https://project.dev"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Technologies (Comma-separated)</label>
                <input
                  type="text"
                  value={projForm.technologies.join(', ')}
                  onChange={(e) => setProjForm({ ...projForm, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="FastAPI, Next.js, Redis, PyTorch"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setProjModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add License or Certification</h3>
              <button type="button" onClick={() => setCertModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveCertification} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Certification Name</label>
                <input
                  type="text"
                  required
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  required
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  placeholder="e.g. Amazon Web Services, Google, Linux Foundation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={certForm.issue_date || ''}
                    onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                    placeholder="May 2024"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credential ID</label>
                  <input
                    type="text"
                    value={certForm.credential_id || ''}
                    onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
                    placeholder="AWS-123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Verification URL</label>
                <input
                  type="url"
                  value={certForm.credential_url || ''}
                  onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                  placeholder="https://credly.com/badges/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setCertModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Add Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Change Profile Photo</h3>
              <button type="button" onClick={() => setAvatarModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Or select an avatar preset:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
                ].map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      uploadAvatar(presetUrl);
                      setAvatarModalOpen(false);
                    }}
                    className="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-600 transition cursor-pointer mx-auto"
                  >
                    <img src={presetUrl} alt="Preset" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAvatarModalOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button
                  type="button"
                  disabled={!customAvatarUrl.trim()}
                  onClick={() => {
                    uploadAvatar(customAvatarUrl.trim());
                    setAvatarModalOpen(false);
                    setCustomAvatarUrl('');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-40"
                >
                  Save URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
