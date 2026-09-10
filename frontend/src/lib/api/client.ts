import { auth, getFirebaseAuth } from '@/lib/firebase/client';

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

export interface ApiErrorPayload {
  code?: string;
  message: string;
  detail?: any;
  requestId?: string;
  status?: number;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public requestId?: string;
  public detail?: any;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status || 500;
    this.code = payload.code || 'API_ERROR';
    this.requestId = payload.requestId;
    this.detail = payload.detail;
  }
}

class CareerApiClient {
  private baseUrl: string;

  constructor() {
    // In browser: use relative proxy path /api/v1 or NEXT_PUBLIC_API_URL
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }

  /**
   * Retrieves fresh Firebase ID token from current authenticated user,
   * with optional forced refresh.
   */
  public async getAuthToken(forceRefresh = false): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const firebaseAuth = auth || getFirebaseAuth();
      if (!firebaseAuth || !firebaseAuth.currentUser) {
        return null;
      }
      return await firebaseAuth.currentUser.getIdToken(forceRefresh);
    } catch (err) {
      console.warn('[ApiClient] Failed to acquire Firebase ID token:', err);
      return null;
    }
  }

  /**
   * Core request dispatcher handling headers, authentication, multipart,
   * timeouts, request IDs, token refresh on 401, and structured error responses.
   */
  public async request<T = any>(
    path: string,
    options: ApiClientOptions = {}
  ): Promise<T> {
    const { timeoutMs = 30000, skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

    const requestId = `req_${Math.random().toString(36).slice(2, 11)}`;
    const headers = new Headers(customHeaders || {});
    headers.set('X-Request-Id', requestId);

    // Attach Bearer token if not skipped
    if (!skipAuth && !headers.has('Authorization')) {
      const token = await this.getAuthToken(false);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Determine target URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let targetUrl: string;

    if (this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')) {
      // If baseUrl already ends with /api/v1, avoid duplicating prefix
      if (cleanPath.startsWith('/api/v1')) {
        const baseRoot = this.baseUrl.replace(/\/api\/v1\/?$/, '');
        targetUrl = `${baseRoot}${cleanPath}`;
      } else {
        targetUrl = `${this.baseUrl.replace(/\/+$/, '')}${cleanPath}`;
      }
    } else {
      // Relative URL (e.g. Next.js API proxy)
      targetUrl = cleanPath.startsWith('/api/v1') ? cleanPath : `/api/v1${cleanPath}`;
    }

    // Prepare abort controller for timeout
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    // If body is FormData, ensure browser sets multipart boundary automatically
    const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
    if (isFormData) {
      headers.delete('Content-Type');
    } else if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    try {
      let response: Response;
      try {
        response = await fetch(targetUrl, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        if (fetchErr.name === 'AbortError') {
          throw new ApiError({
            status: 408,
            code: 'REQUEST_TIMEOUT',
            message: 'CareerAI server took too long to respond. Please try again.',
            requestId,
          });
        }
        // Network errors (connection refused, DNS fail, CORS drop)
        throw new ApiError({
          status: 0,
          code: 'NETWORK_ERROR',
          message: 'Unable to reach CareerAI backend. Please check your internet connection or verify the server is running.',
          requestId,
          detail: fetchErr.message,
        });
      } finally {
        clearTimeout(timeoutTimer);
      }

      // Handle 401 with single token refresh attempt
      if (response.status === 401 && !skipAuth) {
        const refreshedToken = await this.getAuthToken(true);
        if (refreshedToken) {
          headers.set('Authorization', `Bearer ${refreshedToken}`);
          try {
            const retryRes = await fetch(targetUrl, {
              ...fetchOptions,
              headers,
            });
            if (retryRes.ok) {
              const contentType = retryRes.headers.get('content-type') || '';
              return contentType.includes('application/json') ? await retryRes.json() : await retryRes.text();
            }
          } catch {
            // Ignore retry network error and fall through to standard 401
          }
        }
        throw new ApiError({
          status: 401,
          code: 'UNAUTHORIZED',
          message: 'Your session has expired. Please sign in again.',
          requestId,
        });
      }

      // Parse response body
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        data = await response.text().catch(() => null);
      }

      if (!response.ok) {
        const errorMsg =
          (data && typeof data === 'object' && (data.error?.message || data.error || data.detail || data.message)) ||
          this.getDefaultErrorMessage(response.status);

        throw new ApiError({
          status: response.status,
          code: (data && typeof data === 'object' && data.error?.code) || `HTTP_${response.status}`,
          message: errorMsg,
          detail: data,
          requestId: response.headers.get('X-Request-Id') || requestId,
        });
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError({
        status: 500,
        code: 'CLIENT_ERROR',
        message: err.message || 'An unexpected error occurred while processing your request.',
        requestId,
      });
    }
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request data. Please verify your submission.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource or endpoint was not found.';
      case 413:
        return 'Resume file is too large. Maximum allowable size is 10MB.';
      case 422:
        return 'Resume data could not be validated. Please check the uploaded content.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
        return 'CareerAI could not process the resume. Please try again.';
      case 502:
      case 503:
        return 'CareerAI backend service is temporarily unavailable. Please try again in a few moments.';
      default:
        return `Request failed with status ${status}.`;
    }
  }

  // High-Level Resume Endpoints

  /**
   * Uploads resume file or text to backend and creates a registered Resume record in Neon DB.
   */
  public async uploadResume(file?: File | null, text?: string | null): Promise<{
    resume_id: string;
    fileName: string;
    fileSize: number;
    status: string;
  }> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file, file.name);
    }
    if (text) {
      formData.append('text', text);
    }

    return this.request('/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Dispatches background resume analysis and career roadmap generation job.
   */
  public async startResumeAnalysis(
    resumeId: string,
    careerId?: string
  ): Promise<{
    job_id: string;
    resume_id: string;
    status: string;
    progress: number;
    step_message: string;
  }> {
    const formData = new FormData();
    if (careerId) {
      formData.append('career_id', careerId);
    }

    return this.request(`/resumes/${encodeURIComponent(resumeId)}/analyze`, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * One-step asynchronous upload & analysis fallback.
   */
  public async uploadAndAnalyzeAsync(
    file?: File | null,
    text?: string | null,
    careerId?: string
  ): Promise<{
    job_id: string;
    resume_id: string;
    status: string;
    progress: number;
    step_message: string;
  }> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file, file.name);
    }
    if (text) {
      formData.append('text', text);
    }
    if (careerId) {
      formData.append('career_id', careerId);
    }

    return this.request('/resumes/upload-async', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Polls asynchronous job status.
   */
  public async getJobStatus(jobId: string): Promise<{
    job_id: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    step_message: string;
    result?: any;
    error?: string;
  }> {
    return this.request(`/resumes/jobs/${encodeURIComponent(jobId)}`, {
      method: 'GET',
    });
  }

  /**
   * Fetches user's resume analysis history.
   */
  public async getResumeHistory(): Promise<any[]> {
    return this.request('/resumes/history', {
      method: 'GET',
    });
  }
}

export const apiClient = new CareerApiClient();
