// src/hooks/purchase-request-detail/useUpdatePurchaseRequestDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdatePurchaseRequestDetail = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string; 
      data: {
        quantity?: number; 
        unitPrice?: number; 
      };
    }) => {
      const res = await api.put(`/purchase-request-details/${id}`, data);
      return res.data;
    },
  });
};
