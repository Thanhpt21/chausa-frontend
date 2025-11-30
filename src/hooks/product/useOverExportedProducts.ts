// src/hooks/product/useOverExportedProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface OverExportedColor {
  colorTitle: string;
  importedQuantity: number;
  exportedAndTransferredQuantity: number;
  remainingQuantity: number;
}

interface OverExportedProduct {
  id: number;
  title: string;
  sku: string;
  price: number;
  discount: number;
  colors: any[]; // Nếu bạn có kiểu riêng cho color thì thay `any[]`
  negativeStockColors: OverExportedColor[];
  totalRemaining: number;
}

export const useOverExportedProducts = () => {
  return useQuery<ApiResponse<OverExportedProduct[]>>({
    queryKey: ['products-over-exported'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OverExportedProduct[]>>('/products/over-exported');
      return res.data;
    },
  });
};
