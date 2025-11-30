// src/hooks/warehouse/useWarehouseOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useWarehouseOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id, // Chỉ gọi API nếu có id
    queryKey: ['warehouse', id],
    queryFn: async () => {
      const res = await api.get(`/warehouses/${id}`);
      return res.data;
    },
  });
};
