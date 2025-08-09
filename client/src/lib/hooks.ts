import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchProfile,
  updateProfile,
  changePassword,
  verifyToken,
  setStoredTokens,
  clearStoredTokens,
  getStoredTokens,
  fetchTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} from './api';

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await logoutUser();
      } finally {
        clearStoredTokens();
      }
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchProfile,
    select: (res) => res.data,
    retry: false,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useVerifyToken() {
  return useQuery({
    queryKey: ['verify-token'],
    queryFn: verifyToken,
  });
}

export function useIsAuthenticated() {
  const tokens = getStoredTokens();
  return Boolean(tokens?.accessToken);
}

// Tasks hooks
export function useTasks(scope?: 'today' | 'week') {
  return useQuery({
    queryKey: ['tasks', scope ?? 'all'],
    queryFn: () => fetchTasks(scope),
    select: (res) => res.data,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'today'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'week'] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTask>[1] }) => updateTask(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'today'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'week'] });
    },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'today'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'week'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'today'] });
      qc.invalidateQueries({ queryKey: ['tasks', 'week'] });
    },
  });
}



