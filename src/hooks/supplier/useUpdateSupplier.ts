// src/hooks/supplier/useUpdateSupplier.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateSupplier = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        name?: string;
        email?: string;
        phoneNumber?: string;
        address?: string;
        mst?: string;
      };
    }) => {
      const res = await api.put(`/suppliers/${id}`, data);
      return res.data;
    },
  });
};
