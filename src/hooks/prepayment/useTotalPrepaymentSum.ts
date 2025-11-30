// src/hooks/prepayment/useTotalPrepaymentSum.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface TotalPrepaymentSumResponse {
  totalAmount: number;
}

interface UseTotalPrepaymentSumParams {
  startDate?: string;
  endDate?: string;
}

export const useTotalPrepaymentSum = ({ startDate, endDate }: UseTotalPrepaymentSumParams) => {
  return useQuery<TotalPrepaymentSumResponse>({
    queryKey: ['totalPrepaymentSum', startDate, endDate],
    queryFn: async () => {
      const params = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };
      const response = await api.get('/prepayments/total-sum', { params });
      return response.data.data as TotalPrepaymentSumResponse;
    },
  });
};