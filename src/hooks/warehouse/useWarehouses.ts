// src/hooks/warehouse/useWarehouses.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseWarehousesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useWarehouses = ({
  page = 1,
  limit = 10,
  search = '',
}: UseWarehousesParams) => {
  return useQuery({
    queryKey: ['warehouses', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/warehouses', {
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
