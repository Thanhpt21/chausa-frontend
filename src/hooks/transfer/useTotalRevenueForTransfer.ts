// src/hooks/transfer/useTotalRevenueForTransfer.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface TotalRevenueForTransferData {
  totalRevenue: number;
  totalRevenueExported: number;
  totalRevenueCompleted: number;
}

interface UseTotalRevenueForTransferParams {
  startDate?: string;
  endDate?: string;
}

export const useTotalRevenueForTransfer = ({ startDate, endDate }: UseTotalRevenueForTransferParams) => {
  return useQuery<TotalRevenueForTransferData>({
    queryKey: ['total-revenue-transfer', startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transfers/total-revenue', { params });
      return res.data.data as TotalRevenueForTransferData;
    },
  });
};
