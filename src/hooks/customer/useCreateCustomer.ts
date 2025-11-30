// src/hooks/customer/useCreateCustomer.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phoneNumber: string;
      address: string;
      mst: string;
    }) => {
      const res = await api.post('/customers', data);
      return res.data;
    },
  });
};
