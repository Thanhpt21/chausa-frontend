// src/hooks/purchase/useUpdatePurchaseRequest.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PurchaseRequestStatus } from '@/types/purchase-request.type';

export const useUpdatePurchaseRequest = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        note?: string;
        status?: PurchaseRequestStatus;
        supplierId?: number;
        purchase_date?: string;
        // Nếu có thêm trường nào trong DTO update, add vào đây nhé
      };
    }) => {
      const res = await api.put(`/purchase-requests/${id}`, data);
      return res.data;
    },
  });
};
