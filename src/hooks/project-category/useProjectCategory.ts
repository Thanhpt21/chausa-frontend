// src/hooks/projectCategory/useProjectCategory.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useProjectCategory = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['project-category', id],
    queryFn: async () => {
      const res = await api.get(`/project-category/${id}`);
      return res.data;
    },
  });
};
