// src/hooks/prepayment/useUpdatePrepayment.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PrepaymentStatus } from '@/types/prepayment.type';

export const useUpdatePrepayment = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        customerId?: number;
        amountMoney?: number;
        note?: string;
        status: PrepaymentStatus
      };
    }) => {
      const res = await api.put(`/prepayments/${id}`, data);
      return res.data;
    },
  });
};
