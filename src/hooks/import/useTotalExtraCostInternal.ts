// src/hooks/import/useTotalExtraCostInternal.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface TotalExtraCostData {
  totalExtraCost: number;
}

interface UseTotalExtraCostParams {
  startDate?: string;
  endDate?: string;
}

export const useTotalExtraCostInternal = ({ startDate, endDate }: UseTotalExtraCostParams) => {
  return useQuery<TotalExtraCostData>({
    queryKey: ['total-extra-cost-internal', startDate, endDate],
    queryFn: async () => {
      const params = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };
      const res = await api.get('/imports/total-extra-cost', { params });
      return res.data.data as TotalExtraCostData;
    },
  });
};
