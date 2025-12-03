// src/hooks/auth/useLogin.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login, LoginBody } from '@/lib/auth/login'
import { useRouter, useSearchParams } from 'next/navigation'
import { message } from 'antd'

interface LoginResponse {
  success: boolean
  message: string
  access_token: string
  user: {
    id: number
    name: string
    email: string
    phone: string | null
    gender: string | null
    type_account: string
    isActive: boolean
  }
}

export const useLogin = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginBody>({
    mutationFn: login,

    onSuccess: (data) => {
      // 3. Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      // 4. Redirect
      const returnUrl = searchParams.get('returnUrl')
      const redirectTo = returnUrl && returnUrl.startsWith('/') 
        ? decodeURIComponent(returnUrl) 
        : '/admin'

      message.success('Đăng nhập thành công!')
      router.push(redirectTo)
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Đăng nhập thất bại!'
      message.error(msg)
    },
  })
}