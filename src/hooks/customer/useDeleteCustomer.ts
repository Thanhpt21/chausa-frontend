// src/hooks/customer/useDeleteCustomer.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteCustomer = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/customers/${id}`);
      return res.data;
    },
  });
};
