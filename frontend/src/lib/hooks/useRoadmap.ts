'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import {
  RoadmapData,
  RoadmapItemData,
  RoadmapActivityItem,
  LearningPace,
} from '@/lib/types/roadmap';
import { getFallbackRoadmap } from '@/lib/roadmapFallback';

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhaseId, setActivePhaseId] = useState<string>('phase_1');
  const [telemetryStatus, setTelemetryStatus] = useState<'Live' | 'Syncing...' | 'Offline' | 'Cached'>('Syncing...');
  const [isOffline, setIsOffline] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [availableCareers, setAvailableCareers] = useState<Array<{ id: string; title: string }>>([]);
  const [activities, setActivities] = useState<RoadmapActivityItem[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const unsubRef = useRef<Unsubscribe | null>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setTelemetryStatus('Live');
    };
    const handleOffline = () => {
      setIsOffline(true);
      setTelemetryStatus('Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial Fetch from API
  const fetchActiveRoadmap = useCallback(async () => {
    setTelemetryStatus('Syncing...');
    try {
      const [roadRes, profRes, careersRes] = await Promise.allSettled([
        fetch('/api/v1/roadmaps/active', {
          headers: { Authorization: 'Bearer test-sandbox-token' },
          cache: 'no-store',
        }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/profile', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/careers', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.user) {
        setUserProfile(profRes.value.user);
      }

      if (careersRes.status === 'fulfilled' && Array.isArray(careersRes.value?.careers)) {
        setAvailableCareers(careersRes.value.careers);
      } else {
        setAvailableCareers([
          { id: 'c-fs', title: 'Full Stack Developer' },
          { id: 'c-ai', title: 'AI / Machine Learning Engineer' },
          { id: 'c-ba', title: 'Backend Architect' },
          { id: 'c-cloud', title: 'Cloud Infrastructure & DevOps Engineer' },
          { id: 'c-sec', title: 'Cybersecurity Analyst' },
        ]);
      }

      if (roadRes.status === 'fulfilled' && roadRes.value) {
        setRoadmap(roadRes.value);
        if (roadRes.value.phases && roadRes.value.phases.length > 0) {
          const firstIncomplete = roadRes.value.phases.find((p: any) => p.progress_percent < 100);
          setActivePhaseId(firstIncomplete ? firstIncomplete.id : roadRes.value.phases[0].id);
        }
        setTelemetryStatus('Live');
      } else {
        // Fallback demo roadmap
        const fallback = getFallbackRoadmap();
        setRoadmap(fallback);
        setTelemetryStatus('Cached');
      }

      // Initialize activity history
      setActivities([
        {
          id: 'act-1',
          title: 'Roadmap Synchronized',
          action: 'GENERATED',
          category: 'CURRICULUM',
          relative_time: 'Just now',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'act-2',
          title: 'Completed Month 2: Framework Architecture Fundamentals',
          action: 'COMPLETED',
          category: 'LEARNING',
          relative_time: '3 days ago',
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: 'act-3',
          title: 'Completed Month 1 Lab: Software Paradigms Application',
          action: 'COMPLETED',
          category: 'PRACTICE',
          relative_time: '1 week ago',
          timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
      ]);
    } catch (err: any) {
      console.warn('Failed to load active roadmap from server:', err);
      const fallback = getFallbackRoadmap();
      setRoadmap(fallback);
      setTelemetryStatus('Cached');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRoadmap();
  }, [fetchActiveRoadmap]);

  // Firestore Real-Time Subscription
  useEffect(() => {
    if (!roadmap?.id) return;

    const db = getFirebaseFirestore();
    if (!db) return;

    try {
      const docRef = doc(db, 'roadmaps', roadmap.id);
      unsubRef.current = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data) {
              setRoadmap((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  progress_percent: data.progressPercent ?? prev.progress_percent,
                  career_readiness_score: data.careerReadinessScore ?? prev.career_readiness_score,
                  readiness_breakdown: data.readinessBreakdown ?? prev.readiness_breakdown,
                  completed_hours: data.completedHours ?? prev.completed_hours,
                  status: data.status ?? prev.status,
                  version: data.version ?? prev.version,
                  hours_per_week: data.hoursPerWeek ?? prev.hours_per_week,
                  learning_pace: data.learningPace ?? prev.learning_pace,
                };
              });
              setTelemetryStatus('Live');
            }
          }
        },
        (err) => {
          console.warn('[Firestore] Roadmap realtime listener error:', err.message);
        }
      );
    } catch (e) {
      console.warn('[Firestore] Registration error:', e);
    }

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [roadmap?.id]);

  // Actions
  const startItem = async (itemId: string) => {
    // Optimistic UI update
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updated = prev.items.map((i) => (i.id === itemId ? { ...i, status: 'IN_PROGRESS' as const, started_at: new Date().toISOString() } : i));
      return { ...prev, items: updated };
    });

    try {
      await fetch(`/api/v1/roadmaps/items/${itemId}/start`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-sandbox-token' },
      });

      const startedItem = roadmap?.items.find((i) => i.id === itemId);
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          title: `Started: ${startedItem?.title || 'Roadmap Milestone'}`,
          action: 'STARTED',
          category: 'LEARNING',
          relative_time: 'Just now',
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 7),
      ]);
    } catch (err) {
      console.error('Failed to start item:', err);
    }
  };

  const completeItem = async (itemId: string) => {
    const itemToComplete = roadmap?.items.find((i) => i.id === itemId);

    // Optimistic UI update
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            is_completed: true,
            status: 'COMPLETED' as const,
            completed_at: new Date().toISOString(),
            actual_hours: i.estimated_hours,
            tasks: i.tasks.map((t) => ({ ...t, done: true })),
          };
        }
        // Unlock items whose dependencies are satisfied
        if (i.dependencies && i.dependencies.includes(itemId)) {
          return { ...i, status: 'NOT_STARTED' as const };
        }
        return i;
      });

      const completedCount = updatedItems.filter((i) => i.is_completed).length;
      const newOverall = Math.round((completedCount / updatedItems.length) * 100);
      const newReadiness = Math.min(100, Math.round((prev.career_readiness_score || 68) + 2));

      return {
        ...prev,
        progress_percent: newOverall,
        career_readiness_score: newReadiness,
        completed_hours: Math.round(updatedItems.filter((i) => i.is_completed).reduce((acc, curr) => acc + curr.actual_hours, 0)),
        items: updatedItems,
      };
    });

    try {
      await fetch(`/api/v1/roadmaps/items/${itemId}/complete`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-sandbox-token' },
      });

      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          title: `Completed: ${itemToComplete?.title || 'Milestone'}`,
          action: 'COMPLETED',
          category: 'ACHIEVEMENT',
          relative_time: 'Just now',
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 7),
      ]);
    } catch (err) {
      console.error('Failed to complete item:', err);
    }
  };

  const skipItem = async (itemId: string) => {
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updated = prev.items.map((i) => (i.id === itemId ? { ...i, status: 'SKIPPED' as const } : i));
      return { ...prev, items: updated };
    });

    try {
      await fetch(`/api/v1/roadmaps/items/${itemId}/skip`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-sandbox-token' },
      });
    } catch (err) {
      console.error('Failed to skip item:', err);
    }
  };

  const completeResource = async (itemId: string, resourceId: string) => {
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updated = prev.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          resource_links: item.resource_links.map((res) => (res.id === resourceId || res.url === resourceId ? { ...res, is_completed: true } : res)),
        };
      });
      return { ...prev, items: updated };
    });

    try {
      await fetch(`/api/v1/roadmaps/items/${itemId}/resources/${resourceId}/complete`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-sandbox-token' },
      });
    } catch (err) {
      console.error('Failed to complete resource:', err);
    }
  };

  const toggleTask = async (itemId: string, taskId: string, currentDone: boolean) => {
    const newDone = !currentDone;

    setRoadmap((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const newTasks = item.tasks.map((t) => (t.id === taskId ? { ...t, done: newDone } : t));
        const allDone = newTasks.every((t) => t.done);
        return {
          ...item,
          tasks: newTasks,
          is_completed: allDone,
          status: allDone ? ('COMPLETED' as const) : item.status,
        };
      });

      const completedCount = updatedItems.filter((i) => i.is_completed).length;
      return {
        ...prev,
        progress_percent: Math.round((completedCount / updatedItems.length) * 100),
        items: updatedItems,
      };
    });

    try {
      await fetch('/api/roadmap/task', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, taskId, done: newDone }),
      });
    } catch (err) {
      console.error('Task toggle error:', err);
    }
  };

  const saveNotes = async (itemId: string, notes: string) => {
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updated = prev.items.map((i) => (i.id === itemId ? { ...i, notes } : i));
      return { ...prev, items: updated };
    });

    try {
      await fetch('/api/roadmap/task', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, notes }),
      });
    } catch (err) {
      console.error('Notes save error:', err);
    }
  };

  const updateSettings = async (hoursPerWeek: number, pace: LearningPace) => {
    if (!roadmap?.id) return;
    try {
      const res = await fetch(`/api/v1/roadmaps/${roadmap.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours_per_week: hoursPerWeek, learning_pace: pace }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
      }
    } catch (err) {
      console.error('Settings update error:', err);
    }
  };

  const regenerateRoadmap = async (reason: string, hoursPerWeek?: number, pace?: LearningPace, careerId?: string) => {
    if (!roadmap?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/roadmaps/${roadmap.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, hours_per_week: hoursPerWeek, learning_pace: pace, career_id: careerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
        if (data.phases && data.phases.length > 0) {
          setActivePhaseId(data.phases[0].id);
        }
      }
    } catch (err) {
      console.error('Regenerate error:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildRoadmap = async (careerId: string, hoursPerWeek: number = 10, pace: LearningPace = 'balanced') => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/roadmaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career_id: careerId, hours_per_week: hoursPerWeek, learning_pace: pace, duration_months: 6 }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
        if (data.phases && data.phases.length > 0) {
          setActivePhaseId(data.phases[0].id);
        }
      }
    } catch (err) {
      console.error('Build roadmap error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    roadmap,
    loading,
    error,
    activePhaseId,
    setActivePhaseId,
    telemetryStatus,
    isOffline,
    userProfile,
    availableCareers,
    activities,
    isCustomizing,
    setIsCustomizing,
    isRegenerating,
    setIsRegenerating,
    startItem,
    completeItem,
    skipItem,
    completeResource,
    toggleTask,
    saveNotes,
    updateSettings,
    regenerateRoadmap,
    buildRoadmap,
    refreshRoadmap: fetchActiveRoadmap,
  };
}
