'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface CareerEventItem {
  event: string;
  data: any;
  timestamp: string;
}

export function useCareerEvents(token?: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<CareerEventItem[]>([]);
  const [latestEvent, setLatestEvent] = useState<CareerEventItem | null>(null);
  const [activeStage, setActiveStage] = useState<string>('');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const streamUrl = token ? `/api/v1/events/stream?token=${encodeURIComponent(token)}` : '/api/v1/events/stream';
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onerror = (e) => {
      setIsConnected(false);
    };

    const handleEvent = (evtType: string, e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const item: CareerEventItem = {
          event: evtType,
          data: payload.data || payload,
          timestamp: payload.timestamp || new Date().toISOString(),
        };

        setEvents((prev) => [item, ...prev]);
        setLatestEvent(item);

        // Update pipeline stages based on real backend event type
        if (evtType === 'resume.uploaded') {
          setActiveStage('Uploaded');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Uploaded'])));
        } else if (evtType === 'resume.text_extracted') {
          setActiveStage('Text Extracted');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Text Extracted'])));
        } else if (evtType === 'resume.parsed') {
          setActiveStage('Resume Parsed');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Resume Parsed'])));
        } else if (evtType === 'resume.skills_detected') {
          setActiveStage('Skills Detected');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Skills Detected'])));
        } else if (evtType === 'resume.career_analysis_completed') {
          setActiveStage('Career Alignment Analyzed');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Career Alignment Analyzed'])));
        } else if (evtType === 'resume.skill_gap_analysis_completed') {
          setActiveStage('Skill Gaps Identified');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Skill Gaps Identified'])));
        } else if (evtType === 'roadmap.generated') {
          setActiveStage('Roadmap Generated');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Roadmap Generated'])));
        } else if (evtType === 'assignments.generated' || evtType === 'resume.analysis.completed') {
          setActiveStage('Assignments Generated');
          setCompletedStages((prev) => Array.from(new Set([...prev, 'Assignments Generated', 'Complete'])));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('career:data-invalidated', { detail: payload }));
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    // Register listeners for all specified lifecycle events
    const eventTypes = [
      'system.connected',
      'resume.uploaded',
      'resume.text_extracted',
      'resume.parsed',
      'resume.skills_detected',
      'resume.career_analysis_started',
      'resume.career_analysis_completed',
      'resume.skill_gap_analysis_completed',
      'roadmap.generation_started',
      'roadmap.generated',
      'assignments.generated',
      'resume.analysis.completed',
      'profile.updated',
      'skills.updated',
      'career_matches.updated',
      'repository.connected',
      'assignment.started',
      'assignment.submitted',
      'assignment.validation_started',
      'assignment.validation_completed',
      'assignment.completed',
      'roadmap.updated',
    ];

    eventTypes.forEach((type) => {
      es.addEventListener(type, (e: MessageEvent) => handleEvent(type, e));
    });

    es.onmessage = (e: MessageEvent) => handleEvent('message', e);

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [token]);

  const clearStages = useCallback(() => {
    setActiveStage('');
    setCompletedStages([]);
  }, []);

  return {
    isConnected,
    events,
    latestEvent,
    activeStage,
    completedStages,
    clearStages,
  };
}
