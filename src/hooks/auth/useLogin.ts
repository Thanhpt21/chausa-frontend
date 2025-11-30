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

export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginBody> => {

  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginBody>({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (error) => {
      console.error("Login failed:", error.message);
    }
  })
}