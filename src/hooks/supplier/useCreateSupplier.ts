// src/hooks/supplier/useCreateSupplier.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateSupplier = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phoneNumber: string;
      address: string;
      mst: string;
    }) => {
      const res = await api.post('/suppliers', data); // Đường dẫn API dành cho Supplier
      return res.data;
    },
  });
};
