import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PurchaseRequestDetail } from '@/types/purchase-request-detail.type';

export const usePurchaseDetailsByPurchaseId = (purchaseRequestId?: number) => {
  return useQuery({
    queryKey: ['purchase-details-by-purchase', purchaseRequestId],
    enabled: !!purchaseRequestId, // Chỉ gọi khi có ID hợp lệ
    queryFn: async () => {
      const res = await api.get(`/purchase-request-details/by-purchase/${purchaseRequestId}`);
      return res.data.data as PurchaseRequestDetail[]; // Giả sử API trả về data.data
    },
  });
};
