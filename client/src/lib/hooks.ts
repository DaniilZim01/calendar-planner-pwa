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
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchReflectDay,
  fetchReflectRange,
  saveReflect,
  patchReflect,
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
      await qc.cancelQueries({ queryKey: ['tasks'], exact: false });

      const snapshots = qc.getQueriesData<any>({ queryKey: ['tasks'] })
        .map(([key, prev]) => ({ key, prev }));

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

      const isToday = (iso?: string | null) => {
        if (!iso) return false;
        const d = new Date(iso);
        const now = new Date();
        return d.getUTCFullYear() === now.getUTCFullYear() &&
          d.getUTCMonth() === now.getUTCMonth() &&
          d.getUTCDate() === now.getUTCDate();
      };
      const isThisWeek = (iso?: string | null) => {
        if (!iso) return false;
        const d = new Date(Date.UTC(new Date(iso).getUTCFullYear(), new Date(iso).getUTCMonth(), new Date(iso).getUTCDate()));
        const now = new Date();
        const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const day = monday.getUTCDay();
        const diff = (day === 0 ? -6 : 1) - day;
        monday.setUTCDate(monday.getUTCDate() + diff);
        monday.setUTCHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setUTCDate(sunday.getUTCDate() + 6);
        sunday.setUTCHours(23, 59, 59, 999);
        return d >= monday && d <= sunday;
      };

      qc.getQueriesData<any>({ queryKey: ['tasks'] }).forEach(([key]) => {
        const list = qc.getQueryData<any>(key as any) as any[] | undefined;
        if (!Array.isArray(list)) return;
        const scope = Array.isArray(key) && key.length >= 2 ? key[1] : undefined;
        if (scope === 'today') {
          if (isToday(optimistic.due_date)) {
            qc.setQueryData<any>(key as any, [optimistic, ...list]);
          }
          return;
        }
        if (scope === 'week') {
          if (isThisWeek(optimistic.due_date)) {
            qc.setQueryData<any>(key as any, [optimistic, ...list]);
          }
          return;
        }
        // 'all' or other
        qc.setQueryData<any>(key as any, [optimistic, ...list]);
      });

      return { snapshots };
    },
    onError: (_err, _input, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTask>[1] }) => updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: ['tasks'], exact: false });
      const snapshots = qc.getQueriesData<any>({ queryKey: ['tasks'] })
        .map(([key, prev]) => ({ key, prev }));
      qc.getQueriesData<any>({ queryKey: ['tasks'] }).forEach(([key]) => {
        const list = qc.getQueryData<any>(key as any) as any[] | undefined;
        if (!Array.isArray(list)) return;
        qc.setQueryData<any>(key as any, list.map((t) => (t.id === id ? {
          ...t,
          title: input.title ?? t.title,
          description: input.description ?? t.description,
          due_date: input.dueDate ?? t.due_date,
          priority: input.priority ?? t.priority,
          updated_at: new Date().toISOString(),
        } : t)));
      });
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleTask(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['tasks'], exact: false });
      const snapshots = qc.getQueriesData<any>({ queryKey: ['tasks'] })
        .map(([key, prev]) => ({ key, prev }));
      qc.getQueriesData<any>({ queryKey: ['tasks'] }).forEach(([key]) => {
        const list = qc.getQueryData<any>(key as any) as any[] | undefined;
        if (!Array.isArray(list)) return;
        qc.setQueryData<any>(key as any, list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
      });
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['tasks'], exact: false });
      const snapshots = qc.getQueriesData<any>({ queryKey: ['tasks'] })
        .map(([key, prev]) => ({ key, prev }));
      qc.getQueriesData<any>({ queryKey: ['tasks'] }).forEach(([key]) => {
        const list = qc.getQueryData<any>(key as any) as any[] | undefined;
        if (!Array.isArray(list)) return;
        qc.setQueryData<any>(key as any, list.filter((t) => t.id !== id));
      });
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
}


// Events hooks
export function useEvents(params?: { from?: string; to?: string }) {
  const key: (string | undefined)[] = ['events', params?.from, params?.to];
  return useQuery({
    queryKey: key,
    queryFn: () => fetchEvents(params),
    select: (res) => res.data,
  });
}

export function useCreateEvent(listKeyParams?: { from?: string; to?: string }) {
  const qc = useQueryClient();
  const listKey: (string | undefined)[] = ['events', listKeyParams?.from, listKeyParams?.to];
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'], exact: false });
      if (listKey.length) qc.invalidateQueries({ queryKey: listKey as any });
    },
  });
}

export function useUpdateEvent(listKeyParams?: { from?: string; to?: string }) {
  const qc = useQueryClient();
  const listKey: (string | undefined)[] = ['events', listKeyParams?.from, listKeyParams?.to];
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateEvent>[1] }) => updateEvent(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'], exact: false });
      if (listKey.length) qc.invalidateQueries({ queryKey: listKey as any });
    },
  });
}

export function useDeleteEvent(listKeyParams?: { from?: string; to?: string }) {
  const qc = useQueryClient();
  const listKey: (string | undefined)[] = ['events', listKeyParams?.from, listKeyParams?.to];
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'], exact: false });
      if (listKey.length) qc.invalidateQueries({ queryKey: listKey as any });
    },
  });
}


// Reflect hooks
export function useReflectDay(date?: string) {
  return useQuery({
    queryKey: ['reflect', 'day', date || 'today'],
    queryFn: () => fetchReflectDay(date),
    select: (res) => res.data,
  });
}

export function useReflectRange(from: string, to: string) {
  return useQuery({
    queryKey: ['reflect', 'range', from, to],
    queryFn: () => fetchReflectRange(from, to),
    select: (res) => res.data,
    enabled: Boolean(from && to),
    // ensure we always have 7 days filled with zeros for charts
    staleTime: 0,
  });
}

export function useSaveReflect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveReflect,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['reflect'], exact: false });
      const snapshots = qc.getQueriesData<any>({ queryKey: ['reflect'] }).map(([key, prev]) => ({ key, prev }));
      // optimistic for day
      const dayKey = ['reflect', 'day', input.date || 'today'];
      const prevDay = qc.getQueryData<any>(dayKey);
      const nowIso = new Date().toISOString();
      const optimistic = {
        date: input.date || new Date().toISOString().slice(0,10),
        water: input.water ?? prevDay?.water ?? 0,
        sleep: input.sleep ?? prevDay?.sleep ?? 0,
        steps: input.steps ?? prevDay?.steps ?? 0,
        mood: input.mood ?? prevDay?.mood ?? 0,
        journal: input.journal ?? prevDay?.journal ?? null,
        created_at: prevDay?.created_at || nowIso,
        updated_at: nowIso,
      };
      qc.setQueryData(dayKey, optimistic);
      // also update any range caches that include this date
      const dateStr = optimistic.date;
      qc.getQueriesData<any>({ queryKey: ['reflect', 'range'] }).forEach(([key]) => {
        const list = qc.getQueryData<any>(key as any) as Array<any> | undefined;
        if (!Array.isArray(list)) return;
        const found = list.some((d) => d?.date === dateStr);
        if (!found) return;
        const next = list.map((d) => (d.date === dateStr ? { ...d, ...optimistic } : d));
        qc.setQueryData<any>(key as any, next);
      });
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: (_res, _e, vars) => {
      qc.invalidateQueries({ queryKey: ['reflect', 'day', vars?.date || 'today'] });
      qc.invalidateQueries({ queryKey: ['reflect', 'range'], exact: false });
    },
  });
}

export function usePatchReflect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchReflect,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['reflect'], exact: false });
      const snapshots = qc.getQueriesData<any>({ queryKey: ['reflect'] }).map(([key, prev]) => ({ key, prev }));
      const dayKey = ['reflect', 'day', input.date || 'today'];
      const prevDay = qc.getQueryData<any>(dayKey);
      if (prevDay) {
        qc.setQueryData(dayKey, { ...prevDay, ...input, updated_at: new Date().toISOString() });
      }
      // Optimistically update any cached ranges that include this date
      const dateStr = input.date || new Date().toISOString().slice(0, 10);
      qc.getQueriesData<any>({ queryKey: ['reflect', 'range'] }).forEach(([key]) => {
        const list = qc.getQueryData<any>(key as any) as Array<any> | undefined;
        if (!Array.isArray(list)) return;
        const next = list.map((d) => {
          if (d?.date !== dateStr) return d;
          return {
            ...d,
            water: input.water ?? d.water,
            sleep: input.sleep ?? d.sleep,
            steps: input.steps ?? d.steps,
            mood: input.mood ?? d.mood,
            journal: input.journal ?? d.journal,
            updated_at: new Date().toISOString(),
          };
        });
        qc.setQueryData<any>(key as any, next);
      });
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach((s: any) => qc.setQueryData(s.key as any, s.prev));
    },
    onSettled: (_res, _e, vars) => {
      qc.invalidateQueries({ queryKey: ['reflect', 'day', vars?.date || 'today'] });
      qc.invalidateQueries({ queryKey: ['reflect', 'range'], exact: false });
    },
  });
}

