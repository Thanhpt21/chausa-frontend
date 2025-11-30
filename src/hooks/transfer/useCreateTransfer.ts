// src/hooks/transfer/useCreateTransfer.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TransferStatus } from '@/types/transfer.type';

export const useCreateTransfer = () => {
  return useMutation({
    mutationFn: async (data: {
      userId: number;
      customerId: number;
      note?: string;
      status: TransferStatus;
      transfer_date: string;
      total_amount?: number;
      isInternal: boolean;
    }) => {
      const res = await api.post('/transfers', data);
      return res.data;
    },
  });
};
