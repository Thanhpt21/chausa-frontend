// src/hooks/category/useCategories.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseCategoriesParams {
  page?: number
  limit?: number
  search?: string
}

export const useCategories = ({
  page = 1,
  limit = 10,
  search = '',
}: UseCategoriesParams) => {
  return useQuery({
    queryKey: ['categories', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/categories', {
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
