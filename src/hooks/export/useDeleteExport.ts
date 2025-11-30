// src/hooks/export/useDeleteExport.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteExport = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/exports/${id}`);
      return res.data;
    },
  });
};
