// src/hooks/import-detail/useCreateImportDetail.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';  // Giả sử bạn đã có axios instance

interface CreateImportDetailParams {
  importId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export const useCreateImportDetail = () => {
  return useMutation({
    mutationFn: async (data: CreateImportDetailParams) => {
      const res = await api.post('/import-details', data); 
      return res.data;
    },
  });
};
