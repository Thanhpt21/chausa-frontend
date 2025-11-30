// src/hooks/import/useDeleteImport.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteImport = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/imports/${id}`);
      return res.data;
    },
  });
};
