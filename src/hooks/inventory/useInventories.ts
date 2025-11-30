// src/hooks/inventory/useInventories.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseInventoriesParams {
  page?: number;
  limit?: number;
  search?: string;  // nếu inventory hỗ trợ search, còn không thì bỏ
}

export const useInventories = ({
  page = 1,
  limit = 10,
  search = '',
}: UseInventoriesParams) => {
  return useQuery({
    queryKey: ['inventories', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/inventory', {
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
