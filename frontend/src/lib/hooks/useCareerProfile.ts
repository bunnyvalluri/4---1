'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/client';
import { onSnapshot, doc } from 'firebase/firestore';

export interface PersonalInfo {
  name?: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  currently_studying: boolean;
  grade?: string;
  description?: string;
}

export interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  employment_type: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  currently_working: boolean;
  description?: string;
  technologies: string[];
  achievements: string[];
}

export interface SkillItem {
  id?: string;
  skill_name: string;
  category: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  proficiency_numeric: number;
  years_of_experience: number;
  verification_status: 'VERIFIED' | 'SELF_REPORTED' | 'ASSESSMENT_BASED' | 'RESUME_DERIVED';
}

export interface ProjectItem {
  id?: string;
  name: string;
  description?: string;
  role?: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  start_date?: string;
  end_date?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface CareerPreferences {
  target_roles: string[];
  preferred_industries: string[];
  work_mode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  preferred_locations: string[];
  experience_level?: string;
  preferred_technologies: string[];
}

export interface CareerGoals {
  primary_goal?: string;
  goal_timeframe?: string;
  additional_goals: string[];
}

export interface ProfileCompletion {
  percentage: number;
  completed_sections: string[];
  missing_sections: string[];
  section_breakdown: Record<string, number>;
  data_quality_status: string;
  data_quality_issues: string[];
}

export interface CareerReadiness {
  target_career: string;
  career_match_score?: number | null;
  verified_skills_count: number;
  total_skills_count: number;
  priority_gaps_count: number;
  roadmap_progress_pct?: number | null;
  resume_ats_score?: number | null;
  is_stale: boolean;
  stale_reason?: string | null;
}

export interface ProfileInsight {
  headline: string;
  body: string;
  action_label?: string;
  action_route?: string;
  generated_at: string;
}

export interface ProfileActivity {
  id: string;
  action: string;
  entity_type: string;
  description: string;
  timestamp: string;
}

export interface FullCareerProfile {
  user_id: string;
  email: string;
  name: string;
  personal: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  interests: string[];
  preferences: CareerPreferences;
  goals: CareerGoals;
  completion: ProfileCompletion;
  readiness: CareerReadiness;
  insight?: ProfileInsight | null;
  updated_at: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function useCareerProfile() {
  const [profile, setProfile] = useState<FullCareerProfile | null>(null);
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get auth header
  const getAuthToken = async (): Promise<string> => {
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch {}
    // Fallback: check cookie / local storage
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/career_auth_token=([^;]+)/);
      if (match) return match[1];
    }
    return '';
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/v1/profile`, { headers, cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Profile fetch failed: HTTP ${res.status}`);
      }
      const data: FullCareerProfile = await res.json();
      setProfile(data);
      setSyncStatus('synced');

      // Fetch activity audit
      const actRes = await fetch(`${BACKEND_URL}/api/v1/profile/activity?limit=10`, { headers, cache: 'no-store' });
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData);
      }
    } catch (err: any) {
      console.error('[useCareerProfile] fetch error:', err);
      setError(err?.message || 'Unable to connect to profile service.');
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Real-time Firestore snapshot listener on profiles/{userId}
  useEffect(() => {
    if (!profile?.user_id) return;
    try {
      const db = getFirebaseFirestore();
      const unsub = onSnapshot(doc(db, 'profiles', profile.user_id), (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data();
          if (remoteData.updatedAt && remoteData.updatedAt !== profile.updated_at) {
            fetchProfile();
          }
        }
      });
      return () => unsub();
    } catch (e) {
      console.debug('[useCareerProfile] Real-time listener fallback:', e);
    }
  }, [profile?.user_id, profile?.updated_at, fetchProfile]);

  // Warning for unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Mutations
  const updatePersonalInfo = async (updates: PersonalInfo) => {
    setSyncStatus('saving');
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Save failed (HTTP ${res.status})`);
      await fetchProfile();
      setHasUnsavedChanges(false);
      setSyncStatus('synced');
      return true;
    } catch (e) {
      setSyncStatus('error');
      throw e;
    }
  };

  // Education CRUD
  const addEducation = async (item: EducationItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/education`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add education record');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const updateEducation = async (id: string, item: EducationItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/education/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update education record');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const deleteEducation = async (id: string) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/education/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to delete education record');
    await fetchProfile();
    setSyncStatus('synced');
  };

  // Skills CRUD
  const addSkill = async (item: SkillItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add skill');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const updateSkill = async (id: string, item: SkillItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/skills/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update skill');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const deleteSkill = async (id: string) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/skills/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to delete skill');
    await fetchProfile();
    setSyncStatus('synced');
  };

  // Experience CRUD
  const addExperience = async (item: ExperienceItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add experience');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const updateExperience = async (id: string, item: ExperienceItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/experience/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update experience');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const deleteExperience = async (id: string) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/experience/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to delete experience');
    await fetchProfile();
    setSyncStatus('synced');
  };

  // Projects CRUD
  const addProject = async (item: ProjectItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add project');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const updateProject = async (id: string, item: ProjectItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update project');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const deleteProject = async (id: string) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/projects/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to delete project');
    await fetchProfile();
    setSyncStatus('synced');
  };

  // Certifications CRUD
  const addCertification = async (item: CertificationItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/certifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add certification');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const updateCertification = async (id: string, item: CertificationItem) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/certifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update certification');
    await fetchProfile();
    setSyncStatus('synced');
  };

  const deleteCertification = async (id: string) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/certifications/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to delete certification');
    await fetchProfile();
    setSyncStatus('synced');
  };

  // Preferences & Goals
  const updatePreferencesAndGoals = async (preferences: CareerPreferences, goals: CareerGoals) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ preferences, goals }),
    });
    if (!res.ok) throw new Error('Failed to update career preferences');
    await fetchProfile();
    setHasUnsavedChanges(false);
    setSyncStatus('synced');
  };

  // Interests
  const updateInterests = async (interests: string[]) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ interests }),
    });
    if (!res.ok) throw new Error('Failed to update interests');
    await fetchProfile();
    setSyncStatus('synced');
  };

  // Recalculate Downstream Career Matches
  const recalculateMatches = async () => {
    setRecalculating(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/profile/recalculate`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Recalculation failed');
      await fetchProfile();
      return true;
    } finally {
      setRecalculating(false);
    }
  };

  // Avatar Upload / Selection
  const uploadAvatar = async (avatarUrl: string) => {
    setSyncStatus('saving');
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/profile/avatar?avatar_url=${encodeURIComponent(avatarUrl)}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to update profile photo');
    await fetchProfile();
    setSyncStatus('synced');
  };

  return {
    profile,
    activities,
    loading,
    error,
    syncStatus,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    recalculating,
    refetch: fetchProfile,
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
  };
}
