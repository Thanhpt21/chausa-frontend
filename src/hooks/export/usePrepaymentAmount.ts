import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface PrepaymentAmountResponse {
  prepaymentId: number;
  amount: number;
}

export const usePrepaymentAmount = (exportId: number) => {
  return useQuery<PrepaymentAmountResponse>({
    queryKey: ['prepayment-amount', exportId],
    enabled: !!exportId, // chỉ chạy khi có exportId
    queryFn: async () => {
      const res = await api.get(`/exports/${exportId}/prepayment-amount`);
      return res.data.data as PrepaymentAmountResponse;
    },
  });
};
