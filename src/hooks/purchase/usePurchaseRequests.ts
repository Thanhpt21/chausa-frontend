// src/hooks/purchase/usePurchaseRequests.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PurchaseRequestStatus } from '@/types/purchase-request.type';

interface UsePurchaseRequestsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseRequestStatus;
}

export const usePurchaseRequests = ({
  page = 1,
  limit = 10,
  search = '',
  status,
}: UsePurchaseRequestsParams) => {
  return useQuery({
    queryKey: ['purchase-requests', page, limit, search, status],
    queryFn: async () => {
      const res = await api.get('/purchase-requests', {
        params: { page, limit, search, status },
      });

      return {
        data: res.data.data,
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};
