// src/hooks/warranty/useDeleteWarranty.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteWarranty = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/warranty/${id}`)
      return res.data
    },
  })
}
