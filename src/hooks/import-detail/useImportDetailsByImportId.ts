// src/hooks/importDetail/useImportDetailsByImportId.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ImportDetail } from '@/types/import-detail.type';


export const useImportDetailsByImportId = (importId?: number) => {
  return useQuery({
    queryKey: ['import-details-by-import', importId],
    enabled: !!importId, // chỉ gọi API khi importId hợp lệ
    queryFn: async () => {
      const res = await api.get(`/import-details/by-import/${importId}`);
      return res.data.data as ImportDetail[]; // Giả sử API trả về dữ liệu trong trường "data"
    },
  });
};
