// src/hooks/projectCategory/useDeleteProjectCategory.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteProjectCategory = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/project-category/${id}`);
      return res.data;
    },
  });
};
