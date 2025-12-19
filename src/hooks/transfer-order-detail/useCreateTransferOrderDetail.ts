// src/hooks/transfer-order-detail/useCreateTransferOrderDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface CreateTransferOrderDetailParams {
  transferId: number;
  productId: number;
  quantity: number;
  color?: number;
  colorTitle?: string;
  size?: string;
  unit?: string;
  note?: string;
}

export const useCreateTransferOrderDetail = () => {
  return useMutation({
    mutationFn: async (data: CreateTransferOrderDetailParams) => {
      const res = await api.post('/transfer-order-details', data);
      return res.data;
    },
  });
};
