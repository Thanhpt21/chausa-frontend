// src/hooks/prepayment/useDeletePrepayment.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeletePrepayment = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/prepayments/${id}`);
      return res.data;
    },
  });
};
