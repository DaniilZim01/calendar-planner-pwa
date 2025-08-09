import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

type AccessTokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  error?: string;
};

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getStoredTokens(): AccessTokenPair | null {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) ?? '';
    if (!accessToken && !refreshToken) return null;
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: AccessTokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function subscribeTokenRefresh(cb: () => void): void {
  pendingRequests.push(cb);
}

function onRefreshed(): void {
  pendingRequests.forEach((cb) => cb());
  pendingRequests = [];
}

api.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

async function refreshTokens(): Promise<AccessTokenPair | null> {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) return null;
  try {
    const response = await api.post<ApiSuccess<AccessTokenPair>>('/api/auth/refresh', {
      refreshToken: tokens.refreshToken,
    });
    const next = response.data.data;
    setStoredTokens(next);
    return next;
  } catch (error) {
    clearStoredTokens();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => subscribeTokenRefresh(resolve));
      } else {
        originalRequest._retry = true;
        isRefreshing = true;
        const updated = await refreshTokens();
        isRefreshing = false;
        onRefreshed();
        if (!updated) {
          return Promise.reject(error);
        }
      }
      // Retry with new token
      const tokens = getStoredTokens();
      if (tokens?.accessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { name: string; email: string; password: string; phone?: string };

export type AuthResponse = ApiSuccess<{
  user: { id: string; email: string; name?: string | null; phone?: string | null; emailVerified?: boolean };
  accessToken: string;
  refreshToken: string;
}>;

export async function loginUser(input: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', input);
  setStoredTokens({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
  return data;
}

export async function registerUser(input: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/register', input);
  setStoredTokens({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
  return data;
}

export async function logoutUser(): Promise<ApiSuccess<{ message: string }>> {
  const { data } = await api.post<ApiSuccess<{ message: string }>>('/api/auth/logout');
  clearStoredTokens();
  return data;
}

export async function fetchProfile(): Promise<ApiSuccess<{ id: string; email: string; name?: string | null; phone?: string | null }>> {
  const { data } = await api.get<ApiSuccess<{ id: string; email: string; name?: string | null; phone?: string | null }>>('/api/auth/profile');
  return data;
}

export async function updateProfile(input: { name?: string; phone?: string }): Promise<ApiSuccess<{ id: string; email: string; name?: string | null; phone?: string | null }>> {
  const { data } = await api.put<ApiSuccess<{ id: string; email: string; name?: string | null; phone?: string | null }>>('/api/auth/update-profile', input);
  return data;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<ApiSuccess<{ message: string }>> {
  const { data } = await api.put<ApiSuccess<{ message: string }>>('/api/auth/change-password', input);
  return data;
}

export async function verifyToken(): Promise<ApiSuccess<{ valid: boolean }>> {
  const { data } = await api.post<ApiSuccess<{ valid: boolean }>>('/api/auth/verify');
  return data;
}


// Tasks API
export type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  priority?: number; // 1..3
};

export async function fetchTasks(scope?: 'today' | 'week'): Promise<ApiSuccess<ApiTask[]>> {
  const url = scope ? `/api/tasks?scope=${scope}` : '/api/tasks';
  const { data } = await api.get<ApiSuccess<ApiTask[]>>(url);
  return data;
}

export async function createTask(input: TaskInput): Promise<ApiSuccess<ApiTask>> {
  const { data } = await api.post<ApiSuccess<ApiTask>>('/api/tasks', input);
  return data;
}

export async function updateTask(id: string, input: Partial<TaskInput & { completed: boolean }>): Promise<ApiSuccess<ApiTask>> {
  const { data } = await api.put<ApiSuccess<ApiTask>>(`/api/tasks/${id}`, input);
  return data;
}

export async function toggleTask(id: string): Promise<ApiSuccess<ApiTask>> {
  const { data } = await api.patch<ApiSuccess<ApiTask>>(`/api/tasks/${id}`);
  return data;
}

export async function deleteTask(id: string): Promise<ApiSuccess<{ message?: string }>> {
  const { data } = await api.delete<ApiSuccess<{ message?: string }>>(`/api/tasks/${id}`);
  return data;
}



