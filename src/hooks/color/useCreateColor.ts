// src/hooks/color/useCreateColor.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateColor = () => {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      sku: string;
      image?: string;
      colorTypeId?: number;
    }) => {
      const res = await api.post('/colors', data);
      return res.data;
    },
  });
};
