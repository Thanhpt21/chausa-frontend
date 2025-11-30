// src/hooks/import-detail/useUpdateImportDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateImportDetail = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string; // ID của chi tiết phiếu nhập
      data: {
        quantity?: number; // Số lượng
        unitPrice?: number; // Đơn giá
        // Các trường khác nếu cần
      };
    }) => {
      // Gửi yêu cầu PUT để cập nhật chi tiết phiếu nhập
      const res = await api.put(`/import-details/${id}`, data);
      return res.data;
    },
  });
};
