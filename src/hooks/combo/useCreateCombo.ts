// src/hooks/combo/useCreateCombo.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateCombo = () => {
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; price: number; discount?: number }) => {
      const res = await api.post('/combo', data);
      return res.data;
    },
  });
};
