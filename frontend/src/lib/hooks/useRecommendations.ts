'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirebaseApp, getFirebaseFirestore } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// ── Types ───────────────────────────────────────────────────────────────────

export interface RecommendationItem {
  id: string;
  rank: number;
  career_id: string;
  career_title: string;
  career_category: string;
  career_slug: string;
  career_salary_range: string;
  career_demand_level: string;
  career_experience_level: string;
  match_score: number;
  match_level: string;
  skills_score: number;
  interests_score: number;
  aptitude_score: number;
  education_score: number;
  experience_score: number;
  preference_score: number;
  confidence_score: number;
  matching_skills: Array<{ name: string; [key: string]: any }>;
  missing_skills: Array<{ name: string; [key: string]: any }>;
  reasoning: string;
  breakdown: {
    contributingFactors?: Array<{
      id: string;
      name: string;
      score: number;
      weightPercent: number;
      weightedPoints: number;
      status: string;
      insight: string;
    }>;
    confidenceScore?: number;
  };
  recommended_actions: string[];
  top_strength: string;
  primary_gap: string;
  updated_at: string;
}

export interface RecommendationStatus {
  status: 'up_to_date' | 'stale' | 'generating' | 'no_data' | 'error';
  last_analyzed: string | null;
  last_analyzed_relative: string | null;
  is_stale: boolean;
  profile_complete: boolean;
  profile_completion_pct: number;
  missing_profile_items: string[];
  active_job_id: string | null;
  recommendation_count: number;
}

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  stage: string | null;
  stage_label: string | null;
  progress: number;
  message: string | null;
  error: string | null;
  completed_at: string | null;
}

export interface SkillGapItem {
  name: string;
  currentLevel: string;
  targetLevel: string;
  currentScore: number;
  targetScore: number;
  priority: string;
  careerTitle: string;
}

export interface CareerComparisonData {
  careers: Array<{
    career_id: string;
    title: string;
    category: string;
    match_score: number;
    match_level: string;
    skills_score: number;
    interests_score: number;
    aptitude_score: number;
    education_score: number;
    experience_score: number;
    skill_gap_count: number;
    skill_gap_severity: string;
    top_missing_skill: string | null;
    salary_range: string | null;
  }>;
  best_overall: string;
  lowest_gap: string;
  best_interest_fit: string;
}

export interface UseRecommendationsReturn {
  // Data
  items: RecommendationItem[];
  topMatch: RecommendationItem | null;
  status: RecommendationStatus | null;
  categories: string[];
  skillGaps: SkillGapItem[];
  comparison: CareerComparisonData | null;

  // UI state
  loading: boolean;
  error: string | null;
  recalculating: boolean;
  jobStatus: JobStatus | null;
  isOnline: boolean;

  // Filters
  searchQuery: string;
  activeCategory: string;
  sortBy: string;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (c: string) => void;
  setSortBy: (s: string) => void;

  // Comparison
  comparisonCareerIds: string[];
  setComparisonCareerIds: React.Dispatch<React.SetStateAction<string[]>>;
  loadComparison: () => Promise<void>;

  // Actions
  recalculate: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function getFirebaseToken(): Promise<string | null> {
  try {
    const fbApp = getFirebaseApp();
    if (!fbApp) return null;
    const auth = getAuth(fbApp);
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const resolvedToken = token ?? (await getFirebaseToken());
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...(options.headers || {}),
    },
  });
}

// ── Main hook ────────────────────────────────────────────────────────────────

export function useRecommendations(): UseRecommendationsReturn {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [topMatch, setTopMatch] = useState<RecommendationItem | null>(null);
  const [status, setStatus] = useState<RecommendationStatus | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([]);
  const [comparison, setComparison] = useState<CareerComparisonData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const [searchQuery, setSearchQueryState] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('match_score');
  const [comparisonCareerIds, setComparisonCareerIds] = useState<string[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jobPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubscribersRef = useRef<Unsubscribe[]>([]);
  const activeJobIdRef = useRef<string | null>(null);

  // ── Online/offline detection ───────────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // ── Fetch recommendations ─────────────────────────────────────────────────
  const fetchRecommendations = useCallback(async (
    search?: string,
    category?: string,
    sort?: string
  ) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'ALL') params.set('category', category);
      if (sort) params.set('sort_by', sort);

      const res = await apiFetch(`/api/v1/recommendations?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError('Authentication required. Please sign in.');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items ?? []);
      setTopMatch(data.top_match ?? null);
      setStatus(data.status ?? null);
      setCategories(data.categories ?? []);
      setError(null);
    } catch (err: any) {
      setError('Could not load recommendations. Your previous data is shown.');
    }
  }, []);

  // ── Fetch skill gaps ──────────────────────────────────────────────────────
  const fetchSkillGaps = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/dashboard/skill-gaps');
      if (res.ok) {
        const data = await res.json();
        setSkillGaps(Array.isArray(data) ? data : []);
      }
    } catch {
      // Non-critical — don't surface this as an error
    }
  }, []);

  // ── Debounced search ──────────────────────────────────────────────────────
  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRecommendations(q, activeCategory, sortBy);
    }, 350);
  }, [activeCategory, sortBy, fetchRecommendations]);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    fetchRecommendations(searchQuery, cat, sortBy);
  }, [searchQuery, sortBy, fetchRecommendations]);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    fetchRecommendations(searchQuery, activeCategory, sort);
  }, [searchQuery, activeCategory, fetchRecommendations]);

  // ── Job status polling ────────────────────────────────────────────────────
  const startJobPolling = useCallback((jobId: string) => {
    activeJobIdRef.current = jobId;
    if (jobPollRef.current) clearInterval(jobPollRef.current);

    jobPollRef.current = setInterval(async () => {
      try {
        const res = await apiFetch(`/api/v1/recommendations/job/${jobId}`);
        if (!res.ok) return;
        const job: JobStatus = await res.json();
        setJobStatus(job);

        if (job.status === 'completed') {
          clearInterval(jobPollRef.current!);
          jobPollRef.current = null;
          setRecalculating(false);
          activeJobIdRef.current = null;
          // Refresh recommendations after completion
          await fetchRecommendations(searchQuery, activeCategory, sortBy);
          await fetchSkillGaps();
        } else if (job.status === 'failed') {
          clearInterval(jobPollRef.current!);
          jobPollRef.current = null;
          setRecalculating(false);
          setError(`Recalculation failed: ${job.error || 'Unknown error'}`);
          activeJobIdRef.current = null;
        }
      } catch {
        // Polling failure — keep trying
      }
    }, 1200); // Poll every 1.2s for smooth progress
  }, [searchQuery, activeCategory, sortBy, fetchRecommendations, fetchSkillGaps]);

  // ── Recalculate ───────────────────────────────────────────────────────────
  const recalculate = useCallback(async () => {
    setRecalculating(true);
    setJobStatus({ job_id: '', status: 'queued', stage: null, stage_label: 'Starting…', progress: 0, message: 'Queuing job…', error: null, completed_at: null });
    try {
      const res = await apiFetch('/api/v1/recommendations/recalculate', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.job_id) {
        startJobPolling(data.job_id);
      }
    } catch (err: any) {
      setRecalculating(false);
      setError('Failed to start recalculation. Please try again.');
      setJobStatus(null);
    }
  }, [startJobPolling]);

  // ── Load comparison ───────────────────────────────────────────────────────
  const loadComparison = useCallback(async () => {
    if (comparisonCareerIds.length < 2) {
      setComparison(null);
      return;
    }
    try {
      const res = await apiFetch(
        `/api/v1/recommendations/compare?careers=${comparisonCareerIds.join(',')}`
      );
      if (res.ok) {
        setComparison(await res.json());
      }
    } catch {
      setComparison(null);
    }
  }, [comparisonCareerIds]);

  // Run comparison when career IDs change
  useEffect(() => {
    if (comparisonCareerIds.length >= 2) {
      loadComparison();
    } else {
      setComparison(null);
    }
  }, [comparisonCareerIds, loadComparison]);

  // ── Firestore listeners ───────────────────────────────────────────────────
  const setupFirestoreListeners = useCallback((userId: string) => {
    const db = getFirebaseFirestore();
    if (!db) return;

    try {
      // Listen to user's recommendation_jobs
      const jobsCol = collection(db, 'recommendation_jobs');
      const jobsQ = query(jobsCol, where('userId', '==', userId));
      const unsubJobs = onSnapshot(
        jobsQ,
        (snap) => {
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d.status === 'completed' && !recalculating) {
              // Refresh if a job completed externally
              fetchRecommendations(searchQuery, activeCategory, sortBy);
            }
          });
        },
        (err) => {
          // Permission errors are expected if Firestore rules restrict access
        }
      );
      unsubscribersRef.current.push(unsubJobs);
    } catch {
      // Firestore unavailable — degrade gracefully
    }
  }, [recalculating, searchQuery, activeCategory, sortBy, fetchRecommendations]);

  // ── Initial load ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchRecommendations(searchQuery, activeCategory, sortBy),
      fetchSkillGaps(),
    ]);
    setLoading(false);
  }, [fetchRecommendations, fetchSkillGaps, searchQuery, activeCategory, sortBy]);

  useEffect(() => {
    const init = async () => {
      await refresh();

      // Setup Firestore listeners
      try {
        const fbApp = getFirebaseApp();
        if (fbApp) {
          const auth = getAuth(fbApp);
          if (auth.currentUser) {
            setupFirestoreListeners(auth.currentUser.uid);
          }
        }
      } catch {
        // Non-critical
      }
    };

    init();

    return () => {
      unsubscribersRef.current.forEach((u) => u());
      unsubscribersRef.current = [];
      if (jobPollRef.current) clearInterval(jobPollRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    topMatch,
    status,
    categories,
    skillGaps,
    comparison,
    loading,
    error,
    recalculating,
    jobStatus,
    isOnline,
    searchQuery,
    activeCategory,
    sortBy,
    setSearchQuery,
    setActiveCategory: handleCategoryChange,
    setSortBy: handleSortChange,
    comparisonCareerIds,
    setComparisonCareerIds,
    loadComparison,
    recalculate,
    refresh,
  };
}
