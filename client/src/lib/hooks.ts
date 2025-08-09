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
    onMutate: async (input) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: ['tasks'] }),
        qc.cancelQueries({ queryKey: ['tasks', 'today'] }),
        qc.cancelQueries({ queryKey: ['tasks', 'week'] }),
      ]);
      const keys = [
        ['tasks'],
        ['tasks', 'today'],
        ['tasks', 'week'],
      ] as const;
      const snapshots = keys.map((key) => ({ key, prev: qc.getQueryData<any>(key as any) }));
      const optimistic = {
        id: 'temp-' + Date.now(),
        title: input.title,
        description: input.description ?? null,
        due_date: input.dueDate ?? null,
        completed: false,
        priority: input.priority ?? 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      keys.forEach((key) => {
        const prev = qc.getQueryData<any>(key as any);
        if (prev?.data) {
          qc.setQueryData<any>(key as any, {
            ...prev,
            data: [optimistic, ...prev.data],
          });
        }
      });
      return { snapshots };
    },
    onError: (_err, _input, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: () => {
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
    onMutate: async (id: string) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: ['tasks'] }),
        qc.cancelQueries({ queryKey: ['tasks', 'today'] }),
        qc.cancelQueries({ queryKey: ['tasks', 'week'] }),
      ]);
      const keys = [
        ['tasks'],
        ['tasks', 'today'],
        ['tasks', 'week'],
      ] as const;
      const snapshots = keys.map((key) => ({ key, prev: qc.getQueryData<any>(key as any) }));
      keys.forEach((key) => {
        const prev = qc.getQueryData<any>(key as any);
        if (prev?.data) {
          qc.setQueryData<any>(key as any, {
            ...prev,
            data: prev.data.map((t: any) => (t.id === id ? { ...t, completed: !t.completed } : t)),
          });
        }
      });
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: () => {
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



