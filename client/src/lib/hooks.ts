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


