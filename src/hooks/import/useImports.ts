// src/hooks/import/useImports.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseImportsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export const useImports = ({
  page = 1,
  limit = 10,
  search = '',
  status,
}: UseImportsParams) => {
  return useQuery({
    queryKey: ['imports', page, limit, search, status],
    queryFn: async () => {
      const res = await api.get('/imports', {
        params: { page, limit, search, status },
      });

      return {
        data: res.data.data,
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};
