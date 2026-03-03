/**
 * Canonical API Client – Next.js ↔ Flask
 * --------------------------------------------------------
 * - All endpoints used anywhere in the frontend
 * - JSON + FormData handling
 * - Token/cookie helpers (middleware-compatible)
 * - Robust shapes & mapping to what pages expect
 */

import { setAuthCookie, clearAuthCookie } from '@/lib/auth';

/* =========================================================
 * BASE CONFIG
 * ======================================================= */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:5000';

const TOKEN_KEY = 'auth_token';

/* =========================================================
 * TOKEN HELPERS
 * ======================================================= */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  removeToken();
  clearAuthCookie();
  window.location.href = '/auth/login';
}

function authHeaders() {
  const token = getToken() || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* =========================================================
 * FETCH WRAPPERS
 * ======================================================= */

/** Adds JSON headers unless body is FormData; injects Authorization automatically. */
function getFetchOptions(overrides: RequestInit = {}): RequestInit {
  const token = getToken();
  const headers: Record<string, string> = {};

  const isFormData =
    typeof FormData !== 'undefined' && overrides.body instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return { ...overrides, headers: { ...headers, ...(overrides.headers ?? {}) } };
}

/** Standard response handler with 401 redirect. */
async function handleResponse<T = any>(response: Response): Promise<T> {
  const tryJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      clearAuthCookie();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    }
    const msg = (tryJson && (tryJson.message || tryJson.error)) ?? response.statusText;
    console.error('API error:', response.url, response.status, msg);
    throw new Error(msg || `API Error: ${response.status}`);
  }
  return tryJson as T;
}

/* =========================================================
 * AUTH
 * ======================================================= */

export interface LoginResponse {
  token: string;
  user?: { id: string; email: string; name: string };
}

/** Accepts email+password or username+password (compat shim). */
export async function login(emailOrUsername: string, password: string): Promise<LoginResponse> {
  const body = emailOrUsername.includes('@')
    ? { email: emailOrUsername, password }
    : { username: emailOrUsername, password };

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    ...getFetchOptions({ body: JSON.stringify(body) }),
  });
  const data = await handleResponse<LoginResponse>(res);
  if (data.token) {
    setToken(data.token);
    setAuthCookie(data.token);
  }
  return data;
}

export async function signup(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    ...getFetchOptions({ body: JSON.stringify({ name, email, password }) }),
  });
  const data = await handleResponse<LoginResponse>(res);
  if (data.token) {
    setToken(data.token);
    setAuthCookie(data.token);
  }
  return data;
}

/** Optional: if exposed by your Flask app */
export async function getCurrentUser() {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(res);
}

/** Optional: if exposed by your Flask app */
export async function serverLogout() {
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    ...getFetchOptions(),
  });
  logout(); // local cleanup regardless of server status
  return handleResponse(res);
}

/* Password reset */
export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  // Server returns generic OK; ignore content for security
  return res.json().catch(() => ({}));
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Password reset failed');
  return data;
}

/* =========================================================
 * DASHBOARD
 * ======================================================= */

export interface DashboardData {
  user: { id: string; name: string; email: string; title?: string };
  progress: number;                 // %
  sessionsCompleted: number;        // solved count
  totalSessions: number;            // total problems (from Progress or Questions)
  avgScore: number;                 // mirrors progress% unless you store real scores
  upcomingInterview?: { company: string; position: string; daysUntil: number };
  notifications?: number;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard`, {
    method: 'GET',
    cache: 'no-store',
  });
  return handleResponse<DashboardData>(res);
}

/* =========================================================
 * QUESTIONS
 * ======================================================= */

export interface Question {
  id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at?: string;
}

export interface QuestionsResponse {
  items: Question[];
  total: number;
}

export interface CategorySummary {
  name: string;
  count: number;
}

export interface CategoriesResponse {
  items: CategorySummary[];
}

/** Get questions from the DB-driven API (with search & filtering) */
export async function getQuestions(params?: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<QuestionsResponse> {
  const urlParams = new URLSearchParams();
  if (params?.q) urlParams.set('q', params.q);
  if (params?.category) urlParams.set('category', params.category);
  if (params?.page) urlParams.set('page', String(params.page));
  if (params?.limit) urlParams.set('limit', String(params.limit));

  const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
  const res = await fetch(`/api/questions${query}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return { items: [], total: 0 };
  }

  return handleResponse(res);
}

/** Get all categories with counts from DB */
export async function getCategories(): Promise<CategoriesResponse> {
  const res = await fetch('/api/categories', {
    cache: 'no-store',
  });

  if (!res.ok) {
    return { items: [] };
  }

  return handleResponse(res);
}

/** Guaranteed array for interview flow */
export async function getRandomQuestions(count = 10): Promise<Question[]> {
  const res = await fetch(`${API_BASE_URL}/api/questions/random?count=${count}`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  const data = await handleResponse<any>(res);
  if (Array.isArray(data)) return data as Question[];
  if (Array.isArray(data?.questions)) return data.questions as Question[];
  return [];
}

export async function getQuestion(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(res);
}

export async function createQuestion(
  title: string,
  description?: string,
  difficulty?: string,
  category?: string
) {
  const res = await fetch(`${API_BASE_URL}/api/questions`, {
    method: 'POST',
    ...getFetchOptions({ body: JSON.stringify({ title, description, difficulty, category }) }),
  });
  return handleResponse(res);
}

export async function updateQuestion(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: 'PUT',
    ...getFetchOptions({ body: JSON.stringify(data) }),
  });
  return handleResponse(res);
}

export async function deleteQuestion(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: 'DELETE',
    ...getFetchOptions(),
  });
  return handleResponse(res);
}

/* =========================================================
 * PROGRESS
 * ======================================================= */

export interface ProgressData {
  overall: number;                      // %
  sessionsCompleted: number;
  totalSessions: number;
  avgScore: number;                     // equals overall until you store real scores
  currentStreak: number;
  /** UI expects percentage by label; backend returns counts by category */
  categoryBreakdown: Array<{ label: string; percentage: number }>;
  recommendations?: string[];
}

export async function getProgress(): Promise<ProgressData> {
  const res = await fetch(`${API_BASE_URL}/api/progress`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  const raw = await handleResponse<any>(res);

  // Map backend {category, solved, percentage?} -> UI {label, percentage}
  const total = Number(raw?.totalSessions || 0);
  const mapped = Array.isArray(raw?.categoryBreakdown)
    ? raw.categoryBreakdown.map((c: any) => ({
        label: c.category || 'Uncategorized',
        // Use backend percentage if available; otherwise calculate
        percentage:
          c.percentage !== undefined
            ? Number(c.percentage)
            : total > 0
            ? Math.round(((Number(c.solved || 0) / total) * 100 + Number.EPSILON) * 10) / 10
            : 0,
      }))
    : [];

  return {
    overall: Number(raw?.overall || 0),
    sessionsCompleted: Number(raw?.sessionsCompleted || 0),
    totalSessions: Number(raw?.totalSessions || 0),
    avgScore: Number(raw?.avgScore || 0),
    currentStreak: Number(raw?.currentStreak || 0),
    categoryBreakdown: mapped,
    recommendations: raw?.recommendations || [],
  };
}

/* =========================================================
 * SESSIONS (optional future; kept for completeness)
 * ======================================================= */

export interface Session {
  id: string;
  startedAt: string;
  completedAt?: string;
  questionsCount: number;
  avgScore?: number;
  status: 'in_progress' | 'completed';
}

export async function getMySessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(res);
}

export async function startSession(params?: {
  role?: string;
  company?: string;
  questionsCount?: number;
}): Promise<Session> {
  const res = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    ...getFetchOptions({ body: JSON.stringify(params ?? {}) }),
  });
  return handleResponse(res);
}

/** Upload multimedia (FormData). Keeps Authorization header; no JSON content-type. */
export async function saveSessionRecording(
  sessionId: string,
  questionId: string,
  blob: Blob,
  fileName: string
): Promise<{ id: string; fileName: string }> {
  const fd = new FormData();
  fd.append('file', blob, fileName);
  fd.append('sessionId', sessionId);
  fd.append('questionId', questionId);

  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/recordings`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  return handleResponse(res);
}

export async function completeSession(sessionId: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
    method: 'POST',
    ...getFetchOptions(),
  });
  return handleResponse(res);
}

/* =========================================================
 * RESOURCES
 * ======================================================= */

export interface Resource {
  id: number | string;
  title: string;
  desc?: string;
  tags?: string[];
  link?: string;
  category?: string;
  resource_type?: string;
  created_at?: string;
}

export async function getResources(category?: string): Promise<Resource[]> {
  const url = category
    ? `${API_BASE_URL}/api/resources?category=${encodeURIComponent(category)}`
    : `${API_BASE_URL}/api/resources`;
  const res = await fetch(url, { method: 'GET', ...getFetchOptions() });
  const data = await handleResponse<any>(res);
  // backend returns {resources:[...]}
  if (Array.isArray(data)) return data as Resource[];
  return Array.isArray(data?.resources) ? (data.resources as Resource[]) : [];
}

/* =========================================================
 * STUDY PLAN (simple server-generated plan)
 * ======================================================= */

export interface StudyPlanDay {
  day: number;
  date?: string;
  tasks?: string[];      // new
  items?: string[];      // legacy support
  done?: boolean;
}
export interface StudyPlan {
  plan: StudyPlanDay[];
  generatedAt?: string;
}

/** For now we generate on demand; if you later persist, you can GET /api/study-plan. */
export async function getStudyPlan(): Promise<StudyPlan> {
  const res = await fetch(`${API_BASE_URL}/api/study-plan/generate`, {
    method: 'POST',
    ...getFetchOptions({ body: JSON.stringify({ days: 7 }) }),
  });
  return handleResponse(res);
}

export async function updateStudyPlanDay(dayIndex: number, done: boolean): Promise<StudyPlan> {
  const res = await fetch(`${API_BASE_URL}/api/study-plan/day/${dayIndex}`, {
    method: 'PATCH',
    ...getFetchOptions({ body: JSON.stringify({ done }) }),
  });
  return handleResponse(res);
}

/** Generate any period (7 by default) */
export async function generateNextWeek(days = 7): Promise<StudyPlan> {
  const res = await fetch(`${API_BASE_URL}/api/study-plan/generate`, {
    method: 'POST',
    ...getFetchOptions({ body: JSON.stringify({ days }) }),
  });
  return handleResponse(res);
}

/* =========================================================
 * CANDIDATES
 * ======================================================= */

export interface Candidate {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  status?: string;
}

export async function getCandidates() {
  const res = await fetch(`${API_BASE_URL}/api/candidates`, getFetchOptions({ method: 'GET' }));
  return handleResponse(res);
}

export async function getCandidate(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, getFetchOptions({ method: 'GET' }));
  return handleResponse(res);
}

export async function createCandidate(name: string, email: string, phone?: string, status?: string) {
  const res = await fetch(`${API_BASE_URL}/api/candidates`,
    getFetchOptions({ method: 'POST', body: JSON.stringify({ name, email, phone, status }) })
  );
  return handleResponse(res);
}

export async function updateCandidate(id: number, data: Partial<Candidate>) {
  const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`,
    getFetchOptions({ method: 'PUT', body: JSON.stringify(data) })
  );
  return handleResponse(res);
}

export async function deleteCandidate(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, getFetchOptions({ method: 'DELETE' }));
  return handleResponse(res);
}

export async function searchCandidates(query: string) {
  const res = await fetch(`${API_BASE_URL}/api/candidates/search?q=${encodeURIComponent(query)}`,
    getFetchOptions({ method: 'GET' })
  );
  return handleResponse(res);
}

/* =========================================================
 * INTERVIEWS
 * ======================================================= */

export interface Interview {
  id?: number;
  candidate_id: number;
  question_id: number;
  score?: number;
  feedback?: string;
}

export async function getInterviews(candidateId?: number) {
  let url = `${API_BASE_URL}/api/interviews`;
  if (candidateId) url += `?candidate_id=${candidateId}`;
  const res = await fetch(url, getFetchOptions({ method: 'GET' }));
  return handleResponse(res);
}

export async function getInterview(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/interviews/${id}`, getFetchOptions({ method: 'GET' }));
  return handleResponse(res);
}

export async function getCandidateInterviews(candidateId: number) {
  const res = await fetch(`${API_BASE_URL}/api/interviews/candidate/${candidateId}`,
    getFetchOptions({ method: 'GET' })
  );
  return handleResponse(res);
}

export async function createInterview(candidateId: number, questionId: number, score?: number, feedback?: string) {
  const res = await fetch(`${API_BASE_URL}/api/interviews`,
    getFetchOptions({
      method: 'POST',
      body: JSON.stringify({ candidate_id: candidateId, question_id: questionId, score, feedback }),
    })
  );
  return handleResponse(res);
}

export async function updateInterview(id: number, data: Partial<Interview>) {
  const res = await fetch(`${API_BASE_URL}/api/interviews/${id}`,
    getFetchOptions({ method: 'PUT', body: JSON.stringify(data) })
  );
  return handleResponse(res);
}

export async function deleteInterview(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/interviews/${id}`, getFetchOptions({ method: 'DELETE' }));
  return handleResponse(res);
}

/* =========================================================
 * PRACTICE SESSIONS & QUESTION COMPLETION
 * ======================================================= */

export interface PracticeSession {
  id: number;
  user_id: number;
  question_id: number;
  status: 'in_progress' | 'solved' | 'skipped';
  attempts: number;
  solved_at?: string;
  created_at: string;
}

export async function markQuestionComplete(questionId: number) {
  const res = await fetch(
    `/api/questions/${questionId}/complete`,
    { method: 'POST', cache: 'no-store' }
  );
  return handleResponse<{ message: string; session: PracticeSession }>(res);
}

export async function unmarkQuestionComplete(questionId: number) {
  const res = await fetch(
    `/api/questions/${questionId}/complete`,
    { method: 'DELETE', cache: 'no-store' }
  );
  return handleResponse<{ message: string }>(res);
}

export async function getCompletedQuestions() {
  const res = await fetch(
    `/api/user/completed`,
    { cache: 'no-store' }
  );
  return handleResponse<{ completed_questions: number[]; total: number }>(res);
}

export interface UserProgress {
  total_questions: number;
  completed_count: number;
  progress_percentage: number;
  sessions: PracticeSession[];
}

export async function getUserProgress() {
  const res = await fetch(
    `/api/user/progress`,
    { cache: 'no-store' }
  );
  return handleResponse<UserProgress>(res);
}

/* =========================================================
 * HEALTH
 * ======================================================= */

export async function healthCheck() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  } catch (error) {
    return { status: 'offline', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}