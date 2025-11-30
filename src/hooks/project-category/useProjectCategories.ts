// src/hooks/projectCategory/useProjectCategories.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseProjectCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useProjectCategories = ({
  page = 1,
  limit = 10,
  search = '',
}: UseProjectCategoriesParams) => {
  return useQuery({
    queryKey: ['project-categories', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/project-category', {
        params: { page, limit, search },
      });
      return res.data;
    },
  });
};
