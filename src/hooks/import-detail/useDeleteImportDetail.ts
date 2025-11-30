// src/hooks/import-detail/useDeleteImportDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteImportDetail = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      // Gửi yêu cầu DELETE để xóa chi tiết phiếu nhập
      const res = await api.delete(`/import-details/${id}`);
      return res.data;
    },
  });
};
