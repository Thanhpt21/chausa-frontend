// src/hooks/category/useAllCategories.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useAllCategories = (search?: string) => {
  return useQuery({
    queryKey: ['allCategories', search],
    queryFn: async () => {
      const res = await api.get('/categories/all', { // Calls the /categories/all endpoint
        params: { search },
      });
      return res.data.data; // Expects the data to be in res.data.data
    },
  });
};