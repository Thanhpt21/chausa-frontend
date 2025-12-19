// src/hooks/transfer-order-detail/useTransferOrderDetailsByTransferId.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useTransferOrderDetailsByTransferId = (transferId?: number) => {
  return useQuery({
    queryKey: ['transfer-order-details-by-transfer', transferId],
    enabled: !!transferId,
    queryFn: async () => {
      const res = await api.get(`/transfer-order-details/by-transfer/${transferId}`);
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });
};
