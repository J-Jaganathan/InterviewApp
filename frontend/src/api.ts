/**
 * API Utility Module
 * Centralized API calls with JWT authentication
 * Base URL: http://localhost:5000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';;

/**
 * Get JWT token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Build fetch options with Authorization header
 */
function getFetchOptions(overrides: RequestInit = {}): RequestInit {
  const token = getToken();

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const overrideHeaders =
    overrides.headers && typeof overrides.headers === 'object'
      ? (overrides.headers as Record<string, string>)
      : {};

  const headers: Record<string, string> = {
    ...baseHeaders,
    ...overrideHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    ...overrides,
    headers,
  };
}

/**
 * Handle fetch errors and response parsing
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
}

/* ======================== AUTH ENDPOINTS ======================== */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Login user with email and password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

/**
 * Sign up new user
 */
export async function signup(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(response);
}

/* ======================== DASHBOARD ENDPOINTS ======================== */

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    title?: string;
  };
  progress: number;
  sessionsCompleted: number;
  totalSessions: number;
  avgScore: number;
  upcomingInterview?: {
    company: string;
    position: string;
    daysUntil: number;
  };
  notifications?: number;
}

/**
 * Get dashboard data (user profile + stats)
 */
export async function getDashboard(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/* ======================== INTERVIEW QUESTIONS ENDPOINTS ======================== */

export interface Question {
  id: string;
  text: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Get all interview questions (optionally filtered)
 */
export async function getQuestions(params?: {
  category?: string;
  difficulty?: string;
  limit?: number;
}): Promise<Question[]> {
  const queryString = new URLSearchParams();
  if (params?.category) queryString.append('category', params.category);
  if (params?.difficulty) queryString.append('difficulty', params.difficulty);
  if (params?.limit) queryString.append('limit', String(params.limit));

  const response = await fetch(
    `${API_BASE_URL}/api/questions${queryString.toString() ? '?' + queryString.toString() : ''}`,
    {
      method: 'GET',
      ...getFetchOptions(),
    }
  );
  return handleResponse(response);
}

/**
 * Get random interview questions for a session
 */
export async function getRandomQuestions(count: number = 10): Promise<Question[]> {
  const response = await fetch(`${API_BASE_URL}/api/questions/random?count=${count}`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/* ======================== PROGRESS ENDPOINTS ======================== */

export interface ProgressData {
  overall: number;
  sessionsCompleted: number;
  totalSessions: number;
  avgScore: number;
  currentStreak: number;
  categoryBreakdown: Array<{
    label: string;
    percentage: number;
  }>;
  recommendations?: string[];
}

/**
 * Get user's progress data
 */
export async function getProgress(): Promise<ProgressData> {
  const response = await fetch(`${API_BASE_URL}/api/progress`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/* ======================== SESSIONS ENDPOINTS ======================== */

export interface Session {
  id: string;
  startedAt: string;
  completedAt?: string;
  questionsCount: number;
  avgScore?: number;
  status: 'in_progress' | 'completed';
}

/**
 * Get user's interview sessions
 */
export async function getMySessions(): Promise<Session[]> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/**
 * Start a new interview session
 */
export async function startSession(params?: {
  role?: string;
  company?: string;
  questionsCount?: number;
}): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    ...getFetchOptions({
      body: JSON.stringify(params || {}),
    }),
  });
  return handleResponse(response);
}

/**
 * Save session recording
 */
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

  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/recordings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken() || ''}` },
    body: fd,
  });
  return handleResponse(response);
}

/**
 * Complete a session
 */
export async function completeSession(sessionId: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
    method: 'POST',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/* ======================== RESOURCES ENDPOINTS ======================== */

export interface Resource {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  link?: string;
  category?: string;
}

/**
 * Get all resources
 */
export async function getResources(category?: string): Promise<Resource[]> {
  const url = category
    ? `${API_BASE_URL}/api/resources?category=${category}`
    : `${API_BASE_URL}/api/resources`;

  const response = await fetch(url, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/* ======================== STUDY PLAN ENDPOINTS ======================== */

export interface StudyPlanDay {
  day: string;
  items: string[];
  done?: boolean;
}

export interface StudyPlan {
  plan: StudyPlanDay[];
  generatedAt: string;
}

/**
 * Get user's study plan
 */
export async function getStudyPlan(): Promise<StudyPlan> {
  const response = await fetch(`${API_BASE_URL}/api/study-plan`, {
    method: 'GET',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/**
 * Update study plan day status
 */
export async function updateStudyPlanDay(dayIndex: number, done: boolean): Promise<StudyPlan> {
  const response = await fetch(`${API_BASE_URL}/api/study-plan/day/${dayIndex}`, {
    method: 'PATCH',
    ...getFetchOptions({
      body: JSON.stringify({ done }),
    }),
  });
  return handleResponse(response);
}

/**
 * Generate next week's study plan
 */
export async function generateNextWeek(): Promise<StudyPlan> {
  const response = await fetch(`${API_BASE_URL}/api/study-plan/generate`, {
    method: 'POST',
    ...getFetchOptions(),
  });
  return handleResponse(response);
}

/* ======================== UTILITY FUNCTIONS ======================== */

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  window.location.href = '/auth/login';
}
