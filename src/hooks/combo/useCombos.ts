// src/hooks/combo/useCombos.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseCombosParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useCombos = ({ page = 1, limit = 10, search = '' }: UseCombosParams) => {
  return useQuery({
    queryKey: ['combos', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/combo', { params: { page, limit, search } });
      return {
        data: res.data.data,
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};
