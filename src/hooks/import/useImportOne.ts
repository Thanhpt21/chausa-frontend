// src/hooks/import/useImportOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useImportOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['import', id],
    queryFn: async () => {
      const res = await api.get(`/imports/${id}`);
      return res.data;
    },
  });
};
