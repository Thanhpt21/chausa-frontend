// src/hooks/transfer/useTransferOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useTransferOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['transfer', id],
    queryFn: async () => {
      const res = await api.get(`/transfers/${id}`);
      return res.data;
    },
  });
};
