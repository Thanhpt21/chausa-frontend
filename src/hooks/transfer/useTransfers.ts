// src/hooks/transfer/useTransfers.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TransferStatus } from '@/types/transfer.type';

interface UseTransfersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransferStatus;
  startDate?: string;  // Thêm startDate
  endDate?: string;    // Thêm endDate
}

export const useTransfers = ({
  page = 1,
  limit = 10,
  search = '',
  status,
  startDate,
  endDate,
}: UseTransfersParams = {}) => {
  return useQuery({
    queryKey: ['transfers', page, limit, search, status, startDate, endDate],
    queryFn: async () => {
      console.log('📡 Fetching transfers with params:', { page, limit, search, status, startDate, endDate });
      
      try {
        const res = await api.get('/transfers', {
          params: { 
            page, 
            limit, 
            search, 
            status,
            startDate,
            endDate,
          },
        });

        console.log('✅ API Response:', res.data);
        
        return {
          data: res.data.data || [],
          total: res.data.total || 0,
          page: res.data.page || 1,
          pageCount: res.data.pageCount || 0,
        };
      } catch (error: any) {
        console.error('❌ Error fetching transfers:', error);
        // Trả về default data để tránh undefined
        return {
          data: [],
          total: 0,
          page: 1,
          pageCount: 0,
        };
      }
    },
    // Cache trong 5 phút
    staleTime: 5 * 60 * 1000,
    // Retry 2 lần nếu fail
    retry: 2,
  });
};