'use client'

import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { login, LoginBody } from '@/lib/auth/login'

interface LoginResponse {
  success: boolean
  message: string
  access_token: string
  user: {
    id: number
    name: string
    email: string
    role: string
    phoneNumber: string | null
    gender: string | null
    type_account: string
    isActive: boolean
  }
}

import { useRouter } from 'next/navigation'
import { api } from '@/lib/axios'

// hooks/auth/useLogin.ts
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // QUAN TRỌNG: Lưu token từ response
      if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
      }
      
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      router.push('/admin');
    },
  });
};