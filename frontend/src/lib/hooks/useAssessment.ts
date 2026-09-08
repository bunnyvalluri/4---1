'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';

export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  difficulty: string;
  order: number;
}

export interface ReviewQuestionStatus {
  question_id: string;
  order: number;
  category: string;
  is_answered: boolean;
  is_flagged: boolean;
  selected_option?: number;
}

export interface CareerImpact {
  career_title: string;
  match_percentage: number;
  fit_level: string;
  rationale: string;
}

export interface AIInsights {
  summary: string;
  strengths: string[];
  development_areas: string[];
  career_implications: string[];
  recommended_actions: string[];
  ai_confidence?: number;
}

export interface ReviewItem {
  question_id: string;
  category: string;
  question: string;
  options: string[];
  selected_option?: number;
  correct_option: number;
  is_correct: boolean;
  explanation: string;
  difficulty: string;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  status: string;
  score: number;
  performance_tier: string;
  total_questions: number;
  correct_count: number;
  category_scores: Record<string, { score: number; total: number; percentage: number }>;
  strengths: string[];
  weaknesses: string[];
  career_impacts: CareerImpact[];
  ai_insights?: AIInsights;
  review_items?: ReviewItem[];
  completed_at?: string;
}

export type AssessmentStage = 'overview' | 'in_progress' | 'review' | 'processing' | 'results';
export type SaveState = 'idle' | 'saving' | 'saved' | 'syncing' | 'offline' | 'error';

export function useAssessment() {
  const [stage, setStage] = useState<AssessmentStage>('overview');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveState>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [processingStep, setProcessingStep] = useState<number>(0);

  // Connectivity monitoring
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [attemptId]);

  // Initial Data Load (Questions & User Attempt Status)
  useEffect(() => {
    async function initAssessment() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch questions catalog
        const qRes = await fetch('/api/v1/assessments/questions');
        const qData = await qRes.json();
        const loadedQuestions: AssessmentQuestion[] = Array.isArray(qData)
          ? qData
          : qData?.questions || [];
        setQuestions(loadedQuestions);

        // 2. Fetch candidate assessment status
        const statusRes = await fetch('/api/v1/assessments/status');
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.status === 'IN_PROGRESS' && statusData.active_attempt_id) {
            setAttemptId(statusData.active_attempt_id);
            setCurrentIndex(statusData.current_question_index || 0);

            // Fetch attempt details
            try {
              const attRes = await fetch(`/api/v1/assessments/attempts/${statusData.active_attempt_id}`);
              if (attRes.ok) {
                const attData = await attRes.json();
                setAnswers(attData.answers || {});
                setFlagged(new Set(attData.flagged_questions || []));
              }
            } catch {}

            setStage('in_progress');
          } else if (statusData.status === 'COMPLETED' && statusData.latest_result) {
            setResult(statusData.latest_result);
            setStage('results');
          } else {
            setStage('overview');
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize assessment:', err);
        setError('Unable to load assessment diagnostic. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    initAssessment();
  }, []);

  // Real-time Firestore Listener on active attempt
  useEffect(() => {
    if (!attemptId) return;
    const db = getFirebaseFirestore();
    if (!db) return;

    try {
      const attemptDocRef = doc(db, 'assessment_attempts', attemptId);
      const unsubscribe = onSnapshot(
        attemptDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.status === 'COMPLETED' && stage !== 'results') {
              // Remote submission detected
              fetchResults(attemptId);
            }
          }
        },
        (err) => {
          // Firestore listener permission/offline handling
          console.warn('Firestore attempt listener notice:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore subscription skipped:', e);
    }
  }, [attemptId, stage]);

  // Start or resume assessment
  const startAssessment = async (restart = false) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/assessments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restart }),
      });

      const data = await res.json();
      if (res.ok && data.attempt_id) {
        setAttemptId(data.attempt_id);
        setCurrentIndex(data.current_question_index || 0);
        setAnswers(data.answers || {});
        setFlagged(new Set(data.flagged_questions || []));
        setStage('in_progress');
        setSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        setError(data.error || 'Failed to start assessment attempt.');
      }
    } catch (err) {
      console.error('Start assessment error:', err);
      setError('Network connection error while starting assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Autosave Answer Selection
  const selectOption = async (questionId: string, optionIdx: number) => {
    // 1. Immediately update local state
    const nextAnswers = { ...answers, [questionId]: optionIdx };
    setAnswers(nextAnswers);
    setSaveStatus('saving');

    // 2. Queue for offline sync if disconnected
    if (!navigator.onLine || !attemptId) {
      saveToOfflineQueue(questionId, optionIdx);
      setSaveStatus('offline');
      setLastSaved(new Date());
      return;
    }

    // 3. Persist to FastAPI & Firestore
    try {
      const res = await fetch(`/api/v1/assessments/attempts/${attemptId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          selected_option: optionIdx,
          current_question_index: currentIndex,
        }),
      });

      if (res.ok) {
        setSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        saveToOfflineQueue(questionId, optionIdx);
        setSaveStatus('offline');
      }
    } catch (err) {
      saveToOfflineQueue(questionId, optionIdx);
      setSaveStatus('offline');
    }
  };

  // Toggle Flag for Review
  const toggleFlag = async (questionId: string) => {
    const nextFlagged = new Set(flagged);
    const isNowFlagged = !nextFlagged.has(questionId);

    if (isNowFlagged) {
      nextFlagged.add(questionId);
    } else {
      nextFlagged.delete(questionId);
    }
    setFlagged(nextFlagged);

    if (!attemptId) return;

    try {
      await fetch(`/api/v1/assessments/attempts/${attemptId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          flagged: isNowFlagged,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync flag status:', err);
    }
  };

  // Offline queue helpers
  const saveToOfflineQueue = (questionId: string, optionIdx: number) => {
    try {
      const existing = JSON.parse(localStorage.getItem('careerai_pending_answers') || '{}');
      existing[questionId] = optionIdx;
      localStorage.setItem('careerai_pending_answers', JSON.stringify(existing));
    } catch {}
  };

  const flushOfflineQueue = async () => {
    if (!attemptId) return;
    try {
      const pendingStr = localStorage.getItem('careerai_pending_answers');
      if (!pendingStr) return;
      const pending: Record<string, number> = JSON.parse(pendingStr);
      const keys = Object.keys(pending);
      if (keys.length === 0) return;

      setSaveStatus('syncing');
      for (const qId of keys) {
        await fetch(`/api/v1/assessments/attempts/${attemptId}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: qId,
            selected_option: pending[qId],
          }),
        });
      }
      localStorage.removeItem('careerai_pending_answers');
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch {
      setSaveStatus('offline');
    }
  };

  // Submit assessment and execute processing workflow
  const submitAssessment = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    setStage('processing');
    setProcessingStep(0);
    setError(null);

    // Processing stepper animation reflecting backend phases
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        question_id: qId,
        selected_option: opt,
      }));

      const res = await fetch(`/api/v1/assessments/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: formattedAnswers,
          answers_data: answers,
          time_spent_seconds: 180,
        }),
      });

      const data = await res.json();
      clearInterval(stepInterval);
      setProcessingStep(5);

      if (res.ok) {
        setTimeout(() => {
          setResult(data);
          setStage('results');
          setSubmitting(false);

          // Background triggers to ensure cache invalidation across pages
          fetch('/api/v1/recommendations/recalculate', { method: 'POST' }).catch(() => {});
          fetch('/api/v1/skills/recalculate', { method: 'POST' }).catch(() => {});
        }, 500);
      } else {
        throw new Error(data.error || 'Assessment evaluation failed.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Submit assessment error:', err);
      setError(err.message || 'Submission failed. Your answers are saved locally.');
      setSubmitting(false);
      setStage('review');
    }
  };

  const fetchResults = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/assessments/attempts/${id}/results`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setStage('results');
      }
    } catch {}
  };

  const retakeAssessment = () => {
    setResult(null);
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
    startAssessment(true);
  };

  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length || 25;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isCurrentAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const isCurrentFlagged = currentQuestion ? flagged.has(currentQuestion.id) : false;

  // Category completion calculations
  const categorySummary: Record<string, { answered: number; total: number }> = {
    LOGICAL: { answered: 0, total: 0 },
    QUANTITATIVE: { answered: 0, total: 0 },
    VERBAL: { answered: 0, total: 0 },
    ANALYTICAL: { answered: 0, total: 0 },
    PROBLEM_SOLVING: { answered: 0, total: 0 },
  };

  questions.forEach((q) => {
    const cat = q.category?.toUpperCase() || 'LOGICAL';
    if (!categorySummary[cat]) categorySummary[cat] = { answered: 0, total: 0 };
    categorySummary[cat].total += 1;
    if (answers[q.id] !== undefined) categorySummary[cat].answered += 1;
  });

  return {
    stage,
    setStage,
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    flagged,
    attemptId,
    loading,
    submitting,
    saveStatus,
    lastSaved,
    result,
    error,
    isOnline,
    processingStep,
    answeredCount,
    progressPercent,
    isCurrentAnswered,
    isCurrentFlagged,
    categorySummary,
    startAssessment,
    selectOption,
    toggleFlag,
    setCurrentIndex,
    nextQuestion: () => {
      if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
    },
    prevQuestion: () => {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    },
    goToReview: () => setStage('review'),
    submitAssessment,
    retakeAssessment,
  };
}
