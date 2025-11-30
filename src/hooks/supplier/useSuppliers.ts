// src/hooks/supplier/useSuppliers.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseSuppliersParams {
  page?: number;
  limit?: number;
  search?: string; // Tìm kiếm theo tên hoặc thông tin liên quan
}

export const useSuppliers = ({
  page = 1,
  limit = 10,
  search = '',
}: UseSuppliersParams) => {
  return useQuery({
    queryKey: ['suppliers', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/suppliers', {
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
