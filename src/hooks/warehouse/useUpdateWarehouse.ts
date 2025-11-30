// src/hooks/warehouse/useUpdateWarehouse.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateWarehouse = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        name?: string;
        address?: string;
      };
    }) => {
      const res = await api.put(`/warehouses/${id}`, data);
      return res.data;
    },
  });
};
