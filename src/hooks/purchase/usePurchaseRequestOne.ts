// src/hooks/purchase/usePurchaseRequestOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const usePurchaseRequestOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['purchase-request', id],
    queryFn: async () => {
      const res = await api.get(`/purchase-requests/${id}`);
      return res.data;
    },
  });
};
