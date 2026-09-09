'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFirebaseApp } from '@/lib/firebase/client';
import { getAuth } from 'firebase/auth';

const BACKEND_URL = '';

export interface StructuredAction {
  action_type: string;
  title: string;
  description?: string;
  route?: string;
  entity_id?: string;
  requires_confirmation?: boolean;
  parameters?: Record<string, any>;
}

export interface AssistantMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status?: 'QUEUED' | 'STREAMING' | 'COMPLETED' | 'FAILED';
  actions?: StructuredAction[];
  sources?: string[];
  created_at?: string;
}

export interface AssistantSession {
  id: string;
  user_id: string;
  title: string;
  status: 'ACTIVE' | 'ARCHIVED';
  summary?: string;
  message_count: number;
  created_at?: string;
  updated_at?: string;
  last_message_at?: string;
}

export interface CareerContext {
  user_id: string;
  user_name: string;
  email: string;
  target_career?: string;
  career_match_score?: number;
  top_skill_gaps: Array<{
    name: string;
    severity: string;
    requiredProficiency: number;
    currentProficiency: number;
  }>;
  top_skills: Array<{
    name: string;
    proficiency: number;
    isVerified: boolean;
  }>;
  roadmap?: {
    id: string;
    title: string;
    progressPercent: number;
    totalMilestones: number;
    completedMilestones: number;
    nextMilestone?: string;
    currentPhase: number;
  };
  active_project?: {
    id: string;
    projectId: string;
    title: string;
    status: string;
    currentMilestone: string;
    progressPercent: number;
  };
  resume_ats_score?: number;
  assessment_score?: number;
  suggested_prompts: string[];
}

export type AssistantMode = 'standard' | 'interview' | 'learning' | 'quiz' | 'project' | 'resume';

export function useAssistant() {
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [context, setContext] = useState<CareerContext | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingState, setThinkingState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<AssistantMode>('standard');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'connecting' | 'offline'>('connecting');
  const activeSessionRef = useRef<string | null>(null);

  activeSessionRef.current = activeSessionId;

  // Resolve authentic bearer token
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

  // Check application connectivity
  useEffect(() => {
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('online');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Fetch candidate career context
  const fetchContext = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/context`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setContext(data);
        setConnectionStatus('online');
      }
    } catch {
      setConnectionStatus('offline');
    }
  }, [getAuthToken]);

  // Fetch sessions
  const fetchSessions = useCallback(async (query?: string) => {
    setLoadingSessions(true);
    try {
      const token = await getAuthToken();
      const endpoint = query && query.trim()
        ? `${BACKEND_URL}/api/v1/assistant/sessions?q=${encodeURIComponent(query.trim())}`
        : `${BACKEND_URL}/api/v1/assistant/sessions`;
      const res = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        setConnectionStatus('online');

        // Select first active session if none selected
        if (!activeSessionRef.current && data.length > 0) {
          setActiveSessionId(data[0].id);
        }
      }
    } catch {
      setConnectionStatus('offline');
    } finally {
      setLoadingSessions(false);
    }
  }, [getAuthToken]);

  // Load messages for active session
  const fetchSessionMessages = useCallback(async (sessionId: string) => {
    setLoadingMessages(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/sessions/${sessionId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  }, [getAuthToken]);

  // Trigger initial context and sessions fetch
  useEffect(() => {
    fetchContext();
    fetchSessions();
  }, [fetchContext, fetchSessions]);

  // When active session changes, load messages
  useEffect(() => {
    if (activeSessionId) {
      fetchSessionMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, fetchSessionMessages]);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSessions(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchSessions]);

  // Create new consultation session
  const createSession = async (title: string = 'New Consultation', sessionMode: AssistantMode = 'standard') => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, mode: sessionMode }),
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([]);
        setMode(sessionMode);
        return newSession;
      }
    } catch (e) {
      console.error('Failed to create session:', e);
    }
    return null;
  };

  // Rename session
  const renameSession = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/sessions/${sessionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
      }
    } catch (e) {
      console.error('Failed to rename session:', e);
    }
  };

  // Archive session
  const archiveSession = async (sessionId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/sessions/${sessionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (e) {
      console.error('Failed to archive session:', e);
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  };

  // Send message with SSE streaming
  const sendMessage = async (content: string, customMode?: AssistantMode) => {
    const text = content.trim();
    if (!text || isStreaming) return;

    const currentMode = customMode || mode;
    let targetSessionId = activeSessionId;

    // If no active session, create one first
    if (!targetSessionId) {
      const firstWords = text.split(' ').slice(0, 5).join(' ') + '...';
      const created = await createSession(firstWords, currentMode);
      if (created) {
        targetSessionId = created.id;
      }
    }

    const userMsgId = `u-${Date.now()}`;
    const userMessage: AssistantMessage = {
      id: userMsgId,
      session_id: targetSessionId || '',
      role: 'user',
      content: text,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setThinkingState('Understanding your question...');

    const assistantMsgId = `a-${Date.now()}`;
    let streamedContent = '';
    let parsedActions: StructuredAction[] = [];
    let parsedSources: string[] = [];
    let lastFlushTime = 0;

    const flushStreamToState = (force = false) => {
      const now = performance.now();
      if (!force && now - lastFlushTime < 40) return; // Throttle to 25 updates/sec max for 60fps responsiveness
      lastFlushTime = now;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === assistantMsgId);
        if (exists) {
          return prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: streamedContent, status: 'STREAMING', actions: parsedActions, sources: parsedSources }
              : m
          );
        } else {
          return [
            ...prev,
            {
              id: assistantMsgId,
              session_id: targetSessionId || '',
              role: 'assistant',
              content: streamedContent,
              status: 'STREAMING',
              actions: parsedActions,
              sources: parsedSources,
              created_at: new Date().toISOString(),
            },
          ];
        }
      });
    };

    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/sessions/${targetSessionId || 'default'}/stream`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          content: text,
          session_id: targetSessionId,
          mode: currentMode,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Streaming failed: HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.replace('data: ', '').trim();

          if (dataStr === '[DONE]') {
            break;
          } else if (dataStr.startsWith('[THINKING:')) {
            const thinkingMatch = dataStr.match(/\[THINKING:\s*(.*?)\]/);
            if (thinkingMatch) {
              setThinkingState(thinkingMatch[1]);
            }
          } else {
            try {
              const payload = JSON.parse(dataStr);
              if (payload.token) {
                setThinkingState(null);
                streamedContent += payload.token;
                flushStreamToState(false);
              } else if (payload.actions || payload.sources) {
                if (payload.actions) parsedActions = payload.actions;
                if (payload.sources) parsedSources = payload.sources;
                flushStreamToState(true);
              }
            } catch {
              // Raw text chunk fallback
              setThinkingState(null);
              streamedContent += dataStr;
              flushStreamToState(false);
            }
          }
        }
      }

      // Final synchronous flush ensuring 100% of generated content is in state
      flushStreamToState(true);

      // Mark final assistant message as completed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: streamedContent,
                status: 'COMPLETED',
                actions: parsedActions,
                sources: parsedSources,
              }
            : m
        )
      );

      // Refresh context and sessions in background
      fetchContext();
      fetchSessions();
    } catch (err) {
      console.error('Chat stream error:', err);
      // Mark failed
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === assistantMsgId);
        if (exists) {
          return prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: streamedContent || "Aura couldn't complete that response.",
                  status: 'FAILED',
                }
              : m
          );
        } else {
          return [
            ...prev,
            {
              id: assistantMsgId,
              session_id: targetSessionId || '',
              role: 'assistant',
              content: "Aura couldn't complete that response. Please try again.",
              status: 'FAILED',
              created_at: new Date().toISOString(),
            },
          ];
        }
      });
    } finally {
      setIsStreaming(false);
      setThinkingState(null);
    }
  };

  // Execute confirmed career action
  const executeAction = async (
    actionType: string,
    entityId?: string,
    parameters?: Record<string, any>
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/assistant/actions/execute`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action_type: actionType,
          entity_id: entityId,
          parameters,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh context since action modified state
        fetchContext();
        return { success: true, message: data.message, data: data.data };
      } else {
        return { success: false, message: data.detail || 'Action failed to execute' };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error executing action' };
    }
  };

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    context,
    loadingSessions,
    loadingMessages,
    isStreaming,
    thinkingState,
    searchQuery,
    setSearchQuery,
    mode,
    setMode,
    connectionStatus,
    createSession,
    renameSession,
    archiveSession,
    deleteSession,
    sendMessage,
    executeAction,
    refreshContext: fetchContext,
  };
}
