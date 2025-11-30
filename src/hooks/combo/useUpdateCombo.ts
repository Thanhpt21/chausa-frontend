// src/hooks/combo/useUpdateCombo.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateCombo = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: { title?: string; description?: string; price?: number; discount?: number };
    }) => {
      const res = await api.put(`/combo/${id}`, data);
      return res.data;
    },
  });
};
