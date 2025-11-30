// src/hooks/product/useLowStockProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface LowStockColor {
  colorId: number;
  colorTitle: string;
  remainingQuantity: number;
  exportedAndTransferredQuantity: number;
}

interface LowStockProduct {
  id: number;
  title: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  colors: LowStockColor[];
  stockByColor: LowStockColor[];
  totalImported: number;
  totalExportedAndTransferred: number;
  totalRemaining: number;
}

interface UseLowStockProductsParams {
  threshold: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: LowStockProduct[];
}

export const useLowStockProducts = ({ threshold }: UseLowStockProductsParams) => {
  return useQuery<ApiResponse>({
    queryKey: ['low-stock-products', threshold],
    queryFn: async () => {
      const res = await api.get('/products/low-stock', {
        params: { threshold },
      });
      return res.data as ApiResponse;
    },
    enabled: threshold !== undefined && threshold > 0,
  });
};
