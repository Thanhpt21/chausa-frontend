// src/hooks/transfer/useTransferStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface TransferStats {
  total: number;
  pending: number;
  exported: number;
  cancelled: number;
  completed: number;
  expired: number;
}

export const useTransferStats = () => {
  return useQuery<TransferStats>({
    queryKey: ['transfer-stats'],
    queryFn: async () => {
      const res = await api.get('/transfers/stats');
      return res.data.data as TransferStats;  // Cập nhật dữ liệu trả về
    },
  });
};
