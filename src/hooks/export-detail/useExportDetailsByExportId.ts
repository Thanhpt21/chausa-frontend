// src/hooks/export-detail/useExportDetailsByExportId.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ExportDetail } from '@/types/export-detail.type';

export const useExportDetailsByExportId = (exportId?: number) => {
  return useQuery({
    queryKey: ['export-details-by-export', exportId],
    enabled: !!exportId, // chỉ gọi API khi exportId hợp lệ
    queryFn: async () => {
      const res = await api.get(`/export-details/by-export/${exportId}`);  // Đổi URL thành /export-details/by-export
      return res.data.data as ExportDetail[]; // Giả sử API trả về dữ liệu trong trường "data"
    },
    refetchOnWindowFocus: false,  // Không tự động refetch khi window focus
  });
};
