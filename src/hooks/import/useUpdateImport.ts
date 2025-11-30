// src/hooks/import/useUpdateImport.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateImport = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        note?: string;
        status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
        // importDetails?: { productId: number; quantity: number; unitPrice: number }[];
      };
    }) => {
      const res = await api.put(`/imports/${id}`, data);
      return res.data;
    },
  });
};
