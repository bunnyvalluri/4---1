'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirebaseApp, getFirebaseFirestore } from '@/lib/firebase/client';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:') {
      if (
        process.env.NEXT_PUBLIC_BACKEND_URL &&
        process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('https://')
      ) {
        return process.env.NEXT_PUBLIC_BACKEND_URL;
      }
      return '';
    }
    if (window.location.hostname === 'localhost') {
      return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    }
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || '';
}

const BACKEND_URL = getApiBaseUrl();

export interface SkillItem {
  id: string;
  name: string;
  canonical_name: string;
  category: string;
  proficiency: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years_of_experience: number;
  verified: boolean;
  confidence: 'High' | 'Medium' | 'Low';
  evidence_sources: string[];
  last_updated: string;
  learning_status: 'Mastered' | 'Proficient' | 'In Progress' | 'Target';
}

export interface SkillMatrixRow {
  skill: string;
  category: string;
  user_proficiency: number;
  user_level: string;
  required_proficiency: number;
  required_level: string;
  gap: number;
  gap_severity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Ready' | 'Improve' | 'Critical' | 'Optional' | 'Needs Focus';
  action_label: string;
}

export interface CriticalGapItem {
  rank: number;
  skill: string;
  category: string;
  current_level: string;
  target_level: string;
  gap_severity: string;
  priority: string;
  why_it_matters: string;
  recommended_module: string;
  estimated_duration: string;
  action_url: string;
}

export interface LearningProgressItem {
  skill: string;
  current_progress: number;
  current_level: string;
  target_level: string;
  estimated_completion: string;
  status: string;
  action_label: string;
  action_url: string;
}

export interface SkillEvidenceItem {
  skill: string;
  level: string;
  verified: boolean;
  sources: string[];
  resume_detected: boolean;
  project_backed?: string | null;
  assessment_score?: number | null;
  certifications: string[];
  years_experience: number;
}

export interface NextBestSkillAction {
  title: string;
  reason: string;
  progress: number;
  action_label: string;
  action_url: string;
  priority: string;
}

export interface AISkillInsights {
  strongest_area: string;
  biggest_gap: string;
  career_alignment_driver: string;
  next_priority: string;
  summary: string;
  confidence_level: string;
  confidence_reason: string;
}

export interface CareerTarget {
  id: string;
  title: string;
  slug: string;
  match_score: number;
  required_skills_count: number;
  user_skills_count: number;
  skill_coverage_pct: number;
  category: string;
  salary_range: string;
}

export interface SkillOverviewMetrics {
  total_skills: number;
  verified_skills: number;
  strong_skills: number;
  skill_readiness_pct: number;
  critical_gaps_count: number;
  learning_count: number;
  career_alignment_pct: number;
}

export interface SkillHistoricalPoint {
  period: string;
  skill: string;
  proficiency_pct: number;
}

export interface SkillIntelligenceData {
  candidate: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  metrics: SkillOverviewMetrics;
  target_career: CareerTarget;
  available_careers: CareerTarget[];
  categories: Record<string, SkillItem[]>;
  matrix: SkillMatrixRow[];
  critical_gaps: CriticalGapItem[];
  next_action: NextBestSkillAction;
  learning_progress: LearningProgressItem[];
  evidence: SkillEvidenceItem[];
  ai_insights: AISkillInsights;
  trend: SkillHistoricalPoint[];
  live_status: {
    status: string;
    synced: boolean;
    last_updated: string;
    relative_updated: string;
  };
}

export interface CanonicalSkill {
  name: string;
  category: string;
  description: string;
  aliases: string[];
}

export function useSkillIntelligence() {
  const [data, setData] = useState<SkillIntelligenceData | null>(null);
  const [canonicalSkills, setCanonicalSkills] = useState<CanonicalSkill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [relativeUpdated, setRelativeUpdated] = useState<string>('just now');

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name'); // 'name' | 'proficiency' | 'gap' | 'priority' | 'learning'
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

  // Modals
  const [selectedSkillDetail, setSelectedSkillDetail] = useState<SkillItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);

  const unsubscribersRef = useRef<Unsubscribe[]>([]);

  // Token helper
  const getAuthToken = useCallback(async (): Promise<string> => {
    try {
      const fbApp = getFirebaseApp();
      if (fbApp) {
        const auth = getAuth(fbApp);
        const user = auth.currentUser;
        if (user) {
          return await user.getIdToken();
        }
      }
    } catch {
      // Fallback
    }
    return 'test-sandbox-token';
  }, []);

  // Update relative time display
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);
      if (diffSec < 10) setRelativeUpdated('just now');
      else if (diffSec < 60) setRelativeUpdated(`${diffSec} seconds ago`);
      else {
        const mins = Math.floor(diffSec / 60);
        setRelativeUpdated(`${mins} minute${mins > 1 ? 's' : ''} ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchProfile();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch canonical skills for autocomplete
  useEffect(() => {
    async function loadCanonical() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/skills`);
        if (res.ok) {
          const json = await res.json();
          setCanonicalSkills(json);
        }
      } catch (err) {
        console.warn('Failed to fetch canonical skills taxonomy:', err);
      }
    }
    loadCanonical();
  }, []);

  // Main fetch function
  const fetchProfile = useCallback(async (careerIdOverride?: string) => {
    try {
      const token = await getAuthToken();
      const targetCareerParam = careerIdOverride || selectedCareerId;
      const url = targetCareerParam
        ? `${BACKEND_URL}/api/v1/skills/profile?career_id=${encodeURIComponent(targetCareerParam)}`
        : `${BACKEND_URL}/api/v1/skills/profile`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load skills telemetry (HTTP ${res.status})`);
      }

      const json: SkillIntelligenceData = await res.json();
      setData(json);
      setLastSyncTime(new Date());
      setRelativeUpdated('just now');
      setError(null);
    } catch (err: any) {
      console.error('[SkillIntelligence] Fetch error:', err);
      setError(err.message || 'Unable to connect to Skill Intelligence service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsAnalyzing(false);
    }
  }, [getAuthToken, selectedCareerId]);

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Attach Firestore snapshot listeners for zero-refresh real-time updates
  useEffect(() => {
    const db = getFirebaseFirestore();
    if (!db) return;

    try {
      // 1. User Skills listener
      const userSkillsCol = collection(db, 'user_skills');
      const unsubSkills = onSnapshot(
        userSkillsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            // Trigger lightweight synchronization
            fetchProfile();
          }
        },
        (err) => console.warn('[Firestore] user_skills listener warning:', err)
      );
      unsubscribersRef.current.push(unsubSkills);

      // 2. Skill Gaps listener
      const skillGapsCol = collection(db, 'skill_gaps');
      const unsubGaps = onSnapshot(
        skillGapsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            fetchProfile();
          }
        },
        (err) => console.warn('[Firestore] skill_gaps listener warning:', err)
      );
      unsubscribersRef.current.push(unsubGaps);
    } catch (err) {
      console.warn('Firestore real-time listeners initialization pass-through:', err);
    }

    return () => {
      unsubscribersRef.current.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
      unsubscribersRef.current = [];
    };
  }, [fetchProfile]);

  // Mutations
  const addSkill = async (payload: {
    name: string;
    proficiency: number;
    years_of_experience: number;
    category?: string;
    evidence_source?: string;
  }) => {
    setIsAnalyzing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add skill.');
      }

      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Add skill failed:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const patchSkill = async (
    skillId: string,
    updates: {
      proficiency?: number;
      years_of_experience?: number;
      category?: string;
      evidence_source?: string;
    }
  ) => {
    setIsAnalyzing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/skills/${encodeURIComponent(skillId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update skill.');
      }

      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Patch skill failed:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteSkill = async (skillId: string) => {
    setIsAnalyzing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/skills/${encodeURIComponent(skillId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete skill.');
      }

      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Delete skill failed:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const changeTargetCareer = (careerId: string) => {
    setSelectedCareerId(careerId);
    setRefreshing(true);
    fetchProfile(careerId);
  };

  const recalculateAll = async () => {
    setRefreshing(true);
    setIsAnalyzing(true);
    try {
      const token = await getAuthToken();
      await fetch(`${BACKEND_URL}/api/v1/skills/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchProfile();
    } finally {
      setRefreshing(false);
      setIsAnalyzing(false);
    }
  };

  // Filtered & Sorted Skill List
  const filteredSkills = useMemo(() => {
    if (!data?.categories) return [];

    let list: SkillItem[] = [];
    if (activeCategory === 'All') {
      Object.values(data.categories).forEach((catSkills) => {
        list = list.concat(catSkills);
      });
    } else {
      list = data.categories[activeCategory] || [];
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.level.toLowerCase().includes(q) ||
          s.evidence_sources.some((ev) => ev.toLowerCase().includes(q))
      );
    }

    // Sort
    const sorted = [...list];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'proficiency') {
      sorted.sort((a, b) => b.proficiency - a.proficiency);
    } else if (sortBy === 'learning') {
      sorted.sort((a, b) => (b.proficiency === 2 ? 1 : 0) - (a.proficiency === 2 ? 1 : 0));
    } else if (sortBy === 'updated') {
      sorted.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
    }

    return sorted;
  }, [data?.categories, activeCategory, searchQuery, sortBy]);

  // Modal Handlers
  const openAddModal = () => {
    setEditingSkill(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (skill: SkillItem) => {
    setEditingSkill(skill);
    setIsAddEditModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setEditingSkill(null);
  };

  const openSkillDetail = (skill: SkillItem) => {
    setSelectedSkillDetail(skill);
    setIsDetailModalOpen(true);
  };

  const closeSkillDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedSkillDetail(null);
  };

  return {
    data,
    canonicalSkills,
    loading,
    refreshing,
    isAnalyzing,
    isOnline,
    error,
    relativeUpdated,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCareerId,
    changeTargetCareer,
    filteredSkills,
    // Mutations
    addSkill,
    patchSkill,
    deleteSkill,
    recalculateAll,
    refresh: () => {
      setRefreshing(true);
      fetchProfile();
    },
    // Modals
    isAddEditModalOpen,
    editingSkill,
    openAddModal,
    openEditModal,
    closeAddEditModal,
    isDetailModalOpen,
    selectedSkillDetail,
    openSkillDetail,
    closeSkillDetail,
  };
}
