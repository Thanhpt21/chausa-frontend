// src/hooks/inventory/useInventoryOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useInventoryOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['inventory', id],
    queryFn: async () => {
      const res = await api.get(`/inventory/${id}`);
      return res.data;
    },
  });
};
