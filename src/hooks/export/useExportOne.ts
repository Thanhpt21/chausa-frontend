// src/hooks/export/useExportOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useExportOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['export', id],
    queryFn: async () => {
      const res = await api.get(`/exports/${id}`);
      return res.data;
    },
  });
};
