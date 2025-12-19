// src/hooks/transfer-order-detail/useTransferOrderDetails.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseTransferOrderDetailsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useTransferOrderDetails = ({
  page = 1,
  limit = 10,
  search = '',
}: UseTransferOrderDetailsParams) => {
  return useQuery({
    queryKey: ['transferOrderDetails', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/transfer-order-details', {
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
