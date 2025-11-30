// src/hooks/combo/useDeleteCombo.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteCombo = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/combo/${id}`);
      return res.data;
    },
  });
};
