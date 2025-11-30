// src/hooks/transfer-detail/useTransferDetailsByTransferId.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useTransferDetailsByTransferId = (transferId?: number) => {
  return useQuery({
    queryKey: ['transfer-details-by-transfer', transferId],
    enabled: !!transferId,
    queryFn: async () => {
      const res = await api.get(`/transfer-details/by-transfer/${transferId}`);
      return res.data.data; // giả sử API trả về ở trường "data"
    },
    refetchOnWindowFocus: false,
  });
};
