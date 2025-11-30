// src/hooks/export-detail/useExportDetails.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseExportDetailsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useExportDetails = ({
  page = 1,
  limit = 10,
  search = '',
}: UseExportDetailsParams) => {
  return useQuery({
    queryKey: ['exportDetails', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/export-details', {
        params: { page, limit, search },
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
