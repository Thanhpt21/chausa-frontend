// src/hooks/customer/useCustomerOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCustomerOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}`);
      return res.data;
    },
  });
};
