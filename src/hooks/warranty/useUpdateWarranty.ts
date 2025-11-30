// src/hooks/warranty/useUpdateWarranty.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateWarranty = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: { note?: string; isResolved?: boolean }
    }) => {
      const res = await api.put(`/warranty/${id}`, data)
      return res.data
    },
  })
}
