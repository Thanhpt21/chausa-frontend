// src/hooks/transfer-order-detail/useUpdateTransferOrderDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateTransferOrderDetailParams {
  id: number | string;
  data: {
    quantity?: number;
    color?: number;
    colorTitle?: string;
    size?: string;
    note?: string;
    unit?: string;
      unitPrice: number;
  };
}

export const useUpdateTransferOrderDetail = () => {
  return useMutation({
    mutationFn: async ({ id, data }: UpdateTransferOrderDetailParams) => {
      const res = await api.put(`/transfer-order-details/${id}`, data);
      return res.data;
    },
  });
};
