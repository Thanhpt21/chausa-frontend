// src/hooks/transfer-order-detail/useDeleteTransferOrderDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteTransferOrderDetail = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/transfer-order-details/${id}`);
      return res.data;
    },
  });
};
