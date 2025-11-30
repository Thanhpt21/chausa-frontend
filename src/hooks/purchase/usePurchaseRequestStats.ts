// src/hooks/purchase/usePurchaseRequestStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface PurchaseRequestStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export const usePurchaseRequestStats = () => {
  return useQuery<PurchaseRequestStats>({
    queryKey: ['purchase-request-stats'],
    queryFn: async () => {
      const res = await api.get('/purchase-requests/stats');
      return res.data.data as PurchaseRequestStats;
    },
  });
};
