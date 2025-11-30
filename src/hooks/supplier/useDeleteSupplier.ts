// src/hooks/supplier/useDeleteSupplier.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteSupplier = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/suppliers/${id}`);
      return res.data;
    },
  });
};
