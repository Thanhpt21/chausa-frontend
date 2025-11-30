// src/hooks/warehouse/useCreateWarehouse.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateWarehouse = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      address: string;
    }) => {
      const res = await api.post('/warehouses', data);
      return res.data;
    },
  });
};
