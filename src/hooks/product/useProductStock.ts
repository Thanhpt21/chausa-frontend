// src/hooks/product/useProductStock.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface StockData {
  totalImported: number;
  totalExported: number;
  remainingQuantity: number;
}

export const useProductStock = (id: number | string) => {
  return useQuery<ApiResponse<StockData>>({
    queryKey: ['product-stock', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<StockData>>(`/products/${id}/stock`);
      return res.data; // Trả về toàn bộ response bao gồm success, message, và data
    },
    enabled: !!id, // Chỉ gọi API khi có id
  });
};
