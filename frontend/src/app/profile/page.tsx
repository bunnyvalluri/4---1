'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import Link from 'next/link';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [college, setCollege] = useState('');
  const [gradYear, setGradYear] = useState(2026);
  const [cgpa, setCgpa] = useState(8.5);

  const [workExperienceYears, setWorkExperienceYears] = useState(1);
  const [careerGoals, setCareerGoals] = useState('');
  const [interests, setInterests] = useState('');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [preferredIndustries, setPreferredIndustries] = useState('');

  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<{ skillId: string; proficiency: number }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [profRes, skillsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/skills'),
        ]);

        const profData = await profRes.json();
        const skillsData = await skillsRes.json();

        if (profData?.user) {
          const u = profData.user;
          setName(u.name || '');
          setEmail(u.email || '');
          setPhone(u.profile?.phone || '');
          setLocation(u.profile?.location || '');
          setBio(u.profile?.bio || '');
          setDegree(u.profile?.degree || 'Bachelor of Technology');
          setBranch(u.profile?.branch || 'Computer Science and Engineering');
          setCollege(u.profile?.college || '');
          setGradYear(u.profile?.gradYear || 2026);
          setCgpa(u.profile?.cgpa || 8.5);
          setWorkExperienceYears(u.profile?.workExperienceYears || 1);
          setCareerGoals(u.profile?.careerGoals || '');
          setInterests((u.profile?.interests || []).join(', '));
          setPreferredRoles((u.profile?.preferredRoles || []).join(', '));
          setPreferredIndustries((u.profile?.preferredIndustries || []).join(', '));

          if (u.skills) {
            setUserSkills(u.skills.map((us: any) => ({ skillId: us.skillId, proficiency: us.proficiency })));
          }
        }

        if (skillsData?.catalog) {
          setSkillsCatalog(skillsData.catalog);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setError(null);

    try {
      const interestsArray = interests.split(',').map((i) => i.trim()).filter(Boolean);
      const rolesArray = preferredRoles.split(',').map((r) => r.trim()).filter(Boolean);
      const industriesArray = preferredIndustries.split(',').map((i) => i.trim()).filter(Boolean);

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          location,
          bio,
          degree,
          branch,
          college,
          gradYear: Number(gradYear),
          cgpa: Number(cgpa),
          workExperienceYears: Number(workExperienceYears),
          interests: interestsArray,
          preferredRoles: rolesArray,
          preferredIndustries: industriesArray,
          careerGoals,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      // Update skills
      await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: userSkills }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Layers },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'preferences', label: 'Career Preferences', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar userName={name} userEmail={email} />

      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl border shadow-xs">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Candidate Profile</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your credentials, academic specialization, and career targets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {savedSuccess && <span className="text-xs text-emerald-600 font-semibold">Changes saved!</span>}
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Tab Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB: Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address (Read-only)</label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Professional Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: Education */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Academic Qualifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Degree</label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Branch / Major</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">College / University</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Grad Year</label>
                      <input
                        type="number"
                        value={gradYear}
                        onChange={(e) => setGradYear(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        value={cgpa}
                        onChange={(e) => setCgpa(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Technical Skills & Proficiency</h3>
                  <span className="text-xs text-slate-500">{userSkills.length} selected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                  {skillsCatalog.slice(0, 40).map((skill) => {
                    const us = userSkills.find((s) => s.skillId === skill.id);
                    const isSelected = !!us;

                    return (
                      <div
                        key={skill.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          isSelected ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="font-semibold text-slate-800">{skill.name}</span>
                        {isSelected ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={us?.proficiency || 3}
                              onChange={(e) => {
                                const newProf = Number(e.target.value);
                                setUserSkills(
                                  userSkills.map((s) => (s.skillId === skill.id ? { ...s, proficiency: newProf } : s))
                                );
                              }}
                              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                            >
                              <option value={1}>1/5</option>
                              <option value={2}>2/5</option>
                              <option value={3}>3/5</option>
                              <option value={4}>4/5</option>
                              <option value={5}>5/5</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setUserSkills(userSkills.filter((s) => s.skillId !== skill.id))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setUserSkills([...userSkills, { skillId: skill.id, proficiency: 3 }])}
                            className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: Experience */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Work Experience</h3>
                <div className="space-y-1 max-w-xs">
                  <label className="text-xs font-semibold text-slate-700">Total Years of Experience</label>
                  <input
                    type="number"
                    step="0.5"
                    value={workExperienceYears}
                    onChange={(e) => setWorkExperienceYears(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Key Projects & Portfolio</h3>
                <p className="text-xs text-slate-500">
                  Projects are integrated directly from your selected roadmap milestones and the Projects tab.
                </p>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
                  Manage and add verified capstone blueprints under the dedicated <Link href="/projects" className="text-blue-600 font-bold underline">Projects page</Link>.
                </div>
              </div>
            )}

            {/* TAB: Certifications */}
            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Industry Certifications</h3>
                <p className="text-xs text-slate-500">
                  AWS Certified Solutions Architect, CKA (Kubernetes), Google Cloud Professional, CompTIA Security+.
                </p>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
                  Certifications are verified through your uploaded resume and psychometric diagnostic attempts.
                </div>
              </div>
            )}

            {/* TAB: Interests */}
            {activeTab === 'interests' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Interests & Passions</h3>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Comma-separated interests</label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Target Career Preferences</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Preferred Roles</label>
                    <input
                      type="text"
                      value={preferredRoles}
                      onChange={(e) => setPreferredRoles(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Preferred Industries</label>
                    <input
                      type="text"
                      value={preferredIndustries}
                      onChange={(e) => setPreferredIndustries(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Career Goals Statement</label>
                    <textarea
                      rows={3}
                      value={careerGoals}
                      onChange={(e) => setCareerGoals(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
