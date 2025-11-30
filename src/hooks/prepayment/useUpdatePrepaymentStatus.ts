// src/hooks/prepayment/useUpdatePrepaymentStatus.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PrepaymentStatus } from '@/types/prepayment.type';

export const useUpdatePrepaymentStatus = () => {
  return useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: number | string;
      newStatus: PrepaymentStatus
    }) => {
      const res = await api.put(`/prepayments/${id}/status`, { status: newStatus });
      return res.data;
    },
  });
};
