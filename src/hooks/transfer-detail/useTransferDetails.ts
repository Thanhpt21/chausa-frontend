// src/hooks/transfer-detail/useTransferDetails.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseTransferDetailsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useTransferDetails = ({
  page = 1,
  limit = 10,
  search = '',
}: UseTransferDetailsParams) => {
  return useQuery({
    queryKey: ['transferDetails', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/transfer-details', {
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
