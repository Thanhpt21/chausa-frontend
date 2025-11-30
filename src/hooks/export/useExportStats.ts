// src/hooks/export/useExportStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface ExportStats {
  total: number;
  pending: number;
  exporting: number;
  cancelled: number;
  rejected: number;  // Thêm trạng thái REJECTED
  returned: number;  // Thêm trạng thái RETURNED
  completed: number;
}

export const useExportStats = () => {
  return useQuery<ExportStats>({
    queryKey: ['export-stats'],
    queryFn: async () => {
      const res = await api.get('/exports/stats');
      return res.data.data as ExportStats;  // Cập nhật dữ liệu trả về
    },
  });
};
