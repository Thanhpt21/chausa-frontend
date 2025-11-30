// src/hooks/warranty/useWarrantyOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useWarrantyOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['warranty', id],
    queryFn: async () => {
      const res = await api.get(`/warranty/${id}`)
      return res.data
    },
  })
}
