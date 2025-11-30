import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PurchaseRequestStatus } from '@/types/purchase-request.type';

export const useCreatePurchaseRequest = () => {
  return useMutation({
    mutationFn: async (data: {
      note?: string;
      supplierId: number;
      status: PurchaseRequestStatus;
    }) => {
      const res = await api.post('/purchase-requests', data);
      return res.data;
    },
  });
};