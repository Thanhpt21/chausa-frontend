// src/hooks/customer/useCustomers.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseCustomersParams {
  page?: number;
  limit?: number;
  search?: string; // Nếu sau này có hỗ trợ search
}

export const useCustomers = ({
  page = 1,
  limit = 10,
  search = '',
}: UseCustomersParams) => {
  return useQuery({
    queryKey: ['customers', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/customers', {
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
