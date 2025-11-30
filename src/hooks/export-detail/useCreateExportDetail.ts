// src/hooks/export-detail/useCreateExportDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';  // Giả sử bạn đã có axios instance

interface CreateExportDetailParams {
  exportId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export const useCreateExportDetail = () => {
  return useMutation({
    mutationFn: async (data: CreateExportDetailParams) => {
      const res = await api.post('/export-details', data);  // Đổi URL thành /export-details
      return res.data;
    },
  });
};
