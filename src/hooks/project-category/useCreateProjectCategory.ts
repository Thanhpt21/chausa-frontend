// src/hooks/projectCategory/useCreateProjectCategory.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateProjectCategory = () => {
  return useMutation({
    mutationFn: async (data: { title: string }) => {
      const res = await api.post('/project-category', data);
      return res.data;
    },
  });
};
