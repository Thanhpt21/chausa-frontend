// src/hooks/prepayment/useCreatePrepayment.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Prepayment, PrepaymentStatus } from '@/types/prepayment.type';

export const useCreatePrepayment = () => {
  return useMutation({
    mutationFn: async (data: {
      customerId: number;
      amountMoney: number;
      note?: string;
      status: PrepaymentStatus
    }) => {
      const res = await api.post('/prepayments', data);
      return res.data;
    },
  });
};
