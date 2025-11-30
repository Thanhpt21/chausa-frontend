// src/hooks/projectCategory/useUpdateProjectCategory.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateProjectCategory = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: { title?: string };
    }) => {
      const res = await api.put(`/project-category/${id}`, data);
      return res.data;
    },
  });
};
