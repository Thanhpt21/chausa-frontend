// src/hooks/purchase/useDeletePurchaseRequest.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeletePurchaseRequest = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/purchase-requests/${id}`);
      return res.data;
    },
  });
};
