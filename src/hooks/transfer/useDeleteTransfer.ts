// src/hooks/transfer/useDeleteTransfer.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteTransfer = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/transfers/${id}`);
      return res.data;
    },
  });
};
