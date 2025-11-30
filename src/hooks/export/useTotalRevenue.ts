import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface TotalRevenueData {
  totalRevenue: number;
  totalExtraCost: number;
  totalAdditionalCost: number;

  totalRevenueExported: number;
  totalExtraCostExported: number;
  totalAdditionalCostExported: number;

  totalRevenueCompleted: number;
  totalExtraCostCompleted: number;
  totalAdditionalCostCompleted: number;
}

interface UseTotalRevenueParams {
  startDate?: string; // ISO format string
  endDate?: string;
}

export const useTotalRevenue = ({ startDate, endDate }: UseTotalRevenueParams) => {
  return useQuery<TotalRevenueData>({
    queryKey: ['total-revenue', startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/exports/total-revenue', { params });
      return res.data.data as TotalRevenueData;
    },
  });
};
