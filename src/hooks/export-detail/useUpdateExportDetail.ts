// src/hooks/export-detail/useUpdateExportDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateExportDetail = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string; // ID của chi tiết phiếu xuất
      data: {
        quantity?: number; // Số lượng
        unitPrice?: number; // Đơn giá
        // Các trường khác nếu cần
      };
    }) => {
      // Gửi yêu cầu PUT để cập nhật chi tiết phiếu xuất
      const res = await api.put(`/export-details/${id}`, data);  // Đổi URL thành /export-details
      return res.data;
    },
  });
};
