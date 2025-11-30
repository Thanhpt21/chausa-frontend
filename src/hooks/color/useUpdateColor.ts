// src/hooks/color/useUpdateColor.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateColor = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        title?: string;
        sku?: string;
        image?: string;
        colorTypeId?: number;
      };
    }) => {
      const res = await api.put(`/colors/${id}`, data);
      return res.data;
    },
  });
};
