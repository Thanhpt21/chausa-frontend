// src/hooks/prepayment/usePrepaymentOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const usePrepaymentOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['prepayment', id],
    queryFn: async () => {
      const res = await api.get(`/prepayments/${id}`);
      return res.data;
    },
  });
};
