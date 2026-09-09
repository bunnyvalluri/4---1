'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFirebaseFirestore, getFirebaseApp } from '@/lib/firebase/client';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, Unsubscribe } from 'firebase/firestore';

export interface DashboardCandidate {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  college: string;
  profile_completion: number;
  target_career: string;
}

export interface DashboardMetrics {
  career_match: {
    score: number;
    title: string;
    badge: string;
    trend: string;
  };
  skill_readiness: {
    score: number;
    verified_skills: number;
    total_skills: number;
    advanced_skills: number;
    badge: string;
  };
  assessment_index: {
    score: number;
    dimensions: number;
    badge: string;
  };
  resume_ats: {
    score: number;
    rating: string;
    skills_detected: number;
    missing_keywords: number;
    badge: string;
  };
  roadmap_progress: {
    score: number;
    current_month: number;
    total_months: number;
    stage: string;
    badge: string;
  };
  profile_completion: {
    score: number;
    badge: string;
  };
}

export interface NextBestActionItem {
  title: string;
  reason: string;
  action_label: string;
  action_url: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface LiveStatusInfo {
  status: 'Live' | 'Syncing...' | 'Offline' | 'Cached';
  synced: boolean;
  last_updated: string;
  relative_updated: string;
}

export interface CareerMatchBreakdown {
  skills: number;
  interests: number;
  aptitude: number;
  education: number;
  experience: number;
  preference: number;
}

export interface TopCareerPath {
  rank: number;
  careerId: string;
  title: string;
  category: string;
  salaryRange: string;
  matchScore: number;
  strongestFactor: string;
  skillGap: string;
  slug: string;
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

export interface RoadmapMilestoneTask {
  id: string;
  title: string;
  done: boolean;
}

export interface RoadmapMilestone {
  id: string;
  month: number;
  title: string;
  description: string;
  is_completed: boolean;
  tasks: RoadmapMilestoneTask[];
}

export interface RoadmapData {
  career: string;
  progress: number;
  current_stage: string;
  duration_months: number;
  items: RoadmapMilestone[];
}

export interface ResumeData {
  status: 'ANALYZED' | 'PROCESSING' | 'UPLOAD_REQUIRED';
  ats_score: number;
  rating: string;
  skills_detected: number;
  extracted_skills: string[];
  missing_keywords: number;
  missing_keywords_list: string[];
  career_alignment: number;
  analyzed_at: string;
}

export interface AssessmentData {
  radar_data: { subject: string; score: number }[];
  top_strength: string;
  growth_area: string;
  overall_score: number;
  benchmark: number;
  status: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  relative_time: string;
  icon: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function useDashboardRealtime() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telemetryStatus, setTelemetryStatus] = useState<'Live' | 'Syncing...' | 'Offline' | 'Cached'>('Syncing...');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [relativeTime, setRelativeTime] = useState<string>('just now');

  const [candidate, setCandidate] = useState<DashboardCandidate | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [nextAction, setNextAction] = useState<NextBestActionItem | null>(null);
  const [careerMatch, setCareerMatch] = useState<{
    top_match: { title: string; matchScore: number; compatibilityText: string };
    breakdown: CareerMatchBreakdown;
    why_fits: string[];
    top_paths: TopCareerPath[];
  } | null>(null);
  const [skills, setSkills] = useState<{ categories: Record<string, any[]> }>({ categories: {} });
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [assessments, setAssessments] = useState<AssessmentData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unsubscribersRef = useRef<Unsubscribe[]>([]);

  // Update relative time periodically from lastUpdated
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      if (diffSec < 10) setRelativeTime('just now');
      else if (diffSec < 60) setRelativeTime(`${diffSec} seconds ago`);
      else {
        const mins = Math.floor(diffSec / 60);
        setRelativeTime(`${mins} minute${mins > 1 ? 's' : ''} ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Token helper
  const getAuthToken = useCallback(async (): Promise<string | null> => {
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
      // ignore
    }
    return null;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setTelemetryStatus('Syncing...');
    try {
      const token = await getAuthToken();
      // 1. Fetch unified endpoints from FastAPI backend
      const endpoints = [
        `${BACKEND_URL}/api/v1/dashboard/summary`,
        `${BACKEND_URL}/api/v1/dashboard/career-match`,
        `${BACKEND_URL}/api/v1/dashboard/skills`,
        `${BACKEND_URL}/api/v1/dashboard/skill-gaps`,
        `${BACKEND_URL}/api/v1/dashboard/roadmap`,
        `${BACKEND_URL}/api/v1/dashboard/resume`,
        `${BACKEND_URL}/api/v1/dashboard/assessments`,
        `${BACKEND_URL}/api/v1/dashboard/activity`,
        `${BACKEND_URL}/api/v1/notifications`,
      ];

      const responses = await Promise.allSettled(
        endpoints.map((url) =>
          fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }).then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
        )
      );

      const [
        summaryRes,
        matchRes,
        skillsRes,
        gapsRes,
        roadRes,
        resumeRes,
        assessRes,
        actRes,
        notifRes,
      ] = responses;

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        const s = summaryRes.value;
        if (s.candidate) setCandidate(s.candidate);
        if (s.metrics) setMetrics(s.metrics);
        if (s.next_best_action) setNextAction(s.next_best_action);
      }

      if (matchRes.status === 'fulfilled' && matchRes.value) {
        setCareerMatch(matchRes.value);
      }

      if (skillsRes.status === 'fulfilled' && skillsRes.value) {
        setSkills(skillsRes.value);
      }

      if (gapsRes.status === 'fulfilled' && Array.isArray(gapsRes.value)) {
        setSkillGaps(gapsRes.value);
      }

      if (roadRes.status === 'fulfilled' && roadRes.value) {
        setRoadmap(roadRes.value);
      }

      if (resumeRes.status === 'fulfilled' && resumeRes.value) {
        setResume(resumeRes.value);
      }

      if (assessRes.status === 'fulfilled' && assessRes.value) {
        setAssessments(assessRes.value);
      }

      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value)) {
        setActivities(actRes.value);
      }

      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value)) {
        setNotifications(notifRes.value);
      } else {
        setNotifications([]);
      }

      setTelemetryStatus('Live');
      setLastUpdated(new Date());
      setRelativeTime('just now');
      setError(null);
    } catch (err: any) {
      console.warn('[RealtimeDashboard] Fetch error:', err);
      setTelemetryStatus('Cached');
      setError('Live updates temporarily unavailable. Retrying...');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup client-side Firestore listeners when available
  useEffect(() => {
    fetchDashboardData();

    // Check for Firebase Firestore Client
    const db = getFirebaseFirestore();
    if (db) {
      try {
        // Attach snapshot listeners to user's Firestore state if available
        const notifCol = collection(db, 'notifications');
        const unsubNotif = onSnapshot(
          notifCol,
          (snapshot) => {
            if (!snapshot.empty) {
              const liveNotifs: NotificationItem[] = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                liveNotifs.push({
                  id: doc.id,
                  title: data.title || 'Notification',
                  message: data.message || '',
                  type: data.type || 'INFO',
                  is_read: !!data.isRead,
                  link: data.link,
                  created_at: data.createdAt || new Date().toISOString(),
                });
              });
              setNotifications(liveNotifs);
              setLastUpdated(new Date());
              setTelemetryStatus('Live');
            }
          },
          (err) => {
            console.warn('[Firestore] Notification listener pass-through:', err.message);
          }
        );
        unsubscribersRef.current.push(unsubNotif);
      } catch (e) {
        console.warn('[Firestore] Listener registration pass-through:', e);
      }
    }

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [fetchDashboardData]);

  // Interactive mutation: Toggle roadmap milestone task in real time
  const toggleRoadmapTask = async (itemId: string, taskId: string, currentDone: boolean) => {
    const newDone = !currentDone;

    // Optimistic UI update
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const updatedTasks = item.tasks.map((t) => (t.id === taskId ? { ...t, done: newDone } : t));
        const allCompleted = updatedTasks.every((t) => t.done);
        return {
          ...item,
          tasks: updatedTasks,
          is_completed: allCompleted,
        };
      });
      const completedCount = updatedItems.filter((i) => i.is_completed).length;
      const newProgress = Math.round((completedCount / updatedItems.length) * 100);
      return {
        ...prev,
        progress: newProgress,
        items: updatedItems,
      };
    });

    // Update metrics optimistically
    setMetrics((prev) => {
      if (!prev) return prev;
      const completedCount = (roadmap?.items || []).filter((i) => (i.id === itemId ? newDone : i.is_completed)).length;
      const totalCount = roadmap?.items.length || 6;
      return {
        ...prev,
        roadmap_progress: {
          ...prev.roadmap_progress,
          score: Math.round((completedCount / totalCount) * 100),
        },
      };
    });

    try {
      const token = await getAuthToken();
      await fetch(`${BACKEND_URL}/api/v1/dashboard/roadmap/toggle-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          item_id: itemId,
          task_id: taskId,
          done: newDone,
        }),
      });

      // Append real-time activity
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          title: newDone ? 'Completed Roadmap Milestone Task' : 'Reopened Roadmap Milestone Task',
          category: 'ROADMAP',
          relative_time: 'just now',
          icon: 'Map',
        },
        ...prev.slice(0, 5),
      ]);

      setLastUpdated(new Date());
      setRelativeTime('just now');
    } catch (err) {
      console.error('Failed to toggle task on backend:', err);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  return {
    loading,
    error,
    telemetryStatus,
    lastUpdated,
    relativeTime,
    candidate,
    metrics,
    nextAction,
    careerMatch,
    skills,
    skillGaps,
    roadmap,
    resume,
    assessments,
    activities,
    notifications,
    toggleRoadmapTask,
    markNotificationRead,
    refresh: fetchDashboardData,
  };
}
