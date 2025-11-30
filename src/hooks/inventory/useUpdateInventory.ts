// src/hooks/inventory/useUpdateInventory.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateInventory = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: { productId?: number; quantity?: number };
    }) => {
      const res = await api.put(`/inventory/${id}`, data);
      return res.data;
    },
  });
};
