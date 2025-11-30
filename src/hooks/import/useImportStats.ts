// src/hooks/import/useImportStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface ImportStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export const useImportStats = () => {
  return useQuery<ImportStats>({
    queryKey: ['import-stats'],
    queryFn: async () => {
      const res = await api.get('/imports/stats');
      return res.data.data as ImportStats;
    },
  });
};
