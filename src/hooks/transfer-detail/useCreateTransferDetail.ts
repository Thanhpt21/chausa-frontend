// src/hooks/transfer-detail/useCreateTransferDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface CreateTransferDetailParams {
  transferId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  color?: number;
  note?: string;
  unit?: string;
  colorTitle?: string;
}

export const useCreateTransferDetail = () => {
  return useMutation({
    mutationFn: async (data: CreateTransferDetailParams) => {
      const res = await api.post('/transfer-details', data);
      return res.data;
    },
  });
};
