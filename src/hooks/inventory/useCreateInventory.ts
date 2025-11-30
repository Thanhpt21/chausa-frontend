// src/hooks/inventory/useCreateInventory.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateInventory = () => {
  return useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const res = await api.post('/inventory', data);
      return res.data;
    },
  });
};
