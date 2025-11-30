// src/hooks/purchase/useUpdatePurchaseRequestStatus.ts

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PurchaseRequestStatus } from '@/types/purchase-request.type'; // Giả sử bạn đã có enum này

interface UpdatePurchaseStatusPayload {
  id: number | string;
  status: PurchaseRequestStatus;
}

export const useUpdatePurchaseRequestStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: UpdatePurchaseStatusPayload) => {
      const res = await api.put(`/purchase-requests/${id}/status`, { status });
      return res.data;
    },
  });
};
