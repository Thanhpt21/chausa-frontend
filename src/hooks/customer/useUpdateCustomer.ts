// src/hooks/customer/useUpdateCustomer.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateCustomer = () => {
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
        mst?: string
        loyaltyPoint?: number
      };
    }) => {
      const res = await api.put(`/customers/${id}`, data);
      return res.data;
    },
  });
};
