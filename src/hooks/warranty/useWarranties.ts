// src/hooks/warranty/useWarranties.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseWarrantiesParams {
  page?: number
  limit?: number
  search?: string
}

export const useWarranties = ({
  page = 1,
  limit = 10,
  search = '',
}: UseWarrantiesParams) => {
  return useQuery({
    queryKey: ['warranties', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/warranty', {
        params: { page, limit, search },
      })
      return {
        data: res.data.data,
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      }
    },
  })
}
