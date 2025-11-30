// src/hooks/transfer/useUpdateTransfer.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TransferStatus } from '@/types/transfer.type';

export const useUpdateTransfer = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        note?: string;
        status?: TransferStatus;
        total_amount?: number;
        transfer_date?: string;
        customerId?: number;
        isInternal?: boolean;
      };
    }) => {
      const res = await api.put(`/transfers/${id}`, data);
      return res.data;
    },
  });
};
