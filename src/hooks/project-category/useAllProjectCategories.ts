// src/hooks/projectCategory/useAllProjectCategories.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseAllProjectCategoriesParams {
  search?: string;
}

export const useAllProjectCategories = ({ search = '' }: UseAllProjectCategoriesParams) => {
  return useQuery({
    queryKey: ['all-project-categories', search],
    queryFn: async () => {
      const res = await api.get('/project-category/all', {
        params: { search },
      });
      return res.data;
    },
  });
};
