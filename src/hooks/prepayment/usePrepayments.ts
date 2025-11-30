// src/hooks/prepayment/usePrepayments.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UsePrepaymentsParams {
  page?: number;
  limit?: number;
  search?: string; // Tìm kiếm theo tên khách hàng hoặc thông tin khác
}

export const usePrepayments = ({
  page = 1,
  limit = 10,
  search = '',
}: UsePrepaymentsParams) => {
  return useQuery({
    queryKey: ['prepayments', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/prepayments', {
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
