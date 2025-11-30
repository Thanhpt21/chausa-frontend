// src/hooks/transfer/useTransfers.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TransferStatus } from '@/types/transfer.type';

interface UseTransfersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransferStatus;
}

export const useTransfers = ({
  page = 1,
  limit = 10,
  search = '',
  status,
}: UseTransfersParams) => {
  return useQuery({
    queryKey: ['transfers', page, limit, search, status],
    queryFn: async () => {
      const res = await api.get('/transfers', {
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
