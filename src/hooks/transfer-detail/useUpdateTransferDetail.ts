// src/hooks/transfer-detail/useUpdateTransferDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateTransferDetailParams {
  id: number | string;
  data: {
    quantity?: number;
    unitPrice?: number;
    color?: number;
    note?: string;
  };
}

export const useUpdateTransferDetail = () => {
  return useMutation({
    mutationFn: async ({ id, data }: UpdateTransferDetailParams) => {
      const res = await api.put(`/transfer-details/${id}`, data);
      return res.data;
    },
  });
};
