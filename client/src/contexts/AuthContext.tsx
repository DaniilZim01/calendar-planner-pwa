import { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useLogin, useRegister, useLogout, useProfile } from '@/lib/hooks';
import type { LoginRequest, RegisterRequest } from '@/lib/api';

type AuthContextValue = {
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  user: { id: string; email: string; name?: string | null; phone?: string | null } | null;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const { data: me, isLoading: isLoadingProfile } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const value = useMemo<AuthContextValue>(() => ({
    login: async (payload) => {
      setError(null);
      await loginMutation.mutateAsync(payload).then(() => {
        navigate('/');
      }).catch((e) => {
        setError(e?.response?.data?.message ?? 'Login failed');
        throw e;
      });
    },
    register: async (payload) => {
      setError(null);
      await registerMutation.mutateAsync(payload).then(() => {
        navigate('/auth');
      }).catch((e) => {
        setError(e?.response?.data?.message ?? 'Registration failed');
        throw e;
      });
    },
    logout: async () => {
      setError(null);
      await logoutMutation.mutateAsync().then(() => {
        navigate('/auth');
      }).catch(() => {});
    },
    user: me ?? null,
    isLoading: isLoadingProfile || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,
  }), [loginMutation, registerMutation, logoutMutation, me, isLoadingProfile, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}



