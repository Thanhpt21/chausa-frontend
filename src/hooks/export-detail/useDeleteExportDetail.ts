// src/hooks/export-detail/useDeleteExportDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteExportDetail = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      // Gửi yêu cầu DELETE để xóa chi tiết phiếu xuất
      const res = await api.delete(`/export-details/${id}`);  // Đổi URL thành /export-details
      return res.data;
    },
  });
};
