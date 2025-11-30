// src/hooks/export/useExports.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ExportStatus } from '@/types/export.type';

interface UseExportsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ExportStatus
}

export const useExports = ({
  page = 1,
  limit = 10,
  search = '',
  status,
}: UseExportsParams) => {
  return useQuery({
    queryKey: ['exports', page, limit, search, status],
    queryFn: async () => {
      const res = await api.get('/exports', {
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
