// src/hooks/combo/useComboOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useComboOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['combo', id],
    queryFn: async () => {
      const res = await api.get(`/combo/${id}`);
      return res.data;
    },
  });
};
