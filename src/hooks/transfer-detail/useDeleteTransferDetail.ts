// src/hooks/transfer-detail/useDeleteTransferDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteTransferDetail = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/transfer-details/${id}`);
      return res.data;
    },
  });
};
