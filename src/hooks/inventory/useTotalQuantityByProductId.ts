// src/hooks/inventory/useTotalQuantityByProductId.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useTotalQuantityByProductId = (productId?: number) => {
  return useQuery({
    queryKey: ['inventory-total-quantity', productId],
    enabled: !!productId, // chỉ gọi API khi productId hợp lệ
    queryFn: async () => {
      // Gọi API mới với endpoint "/inventory/product/:productId/total"
      const res = await api.get(`/inventory/product/${productId}/total`);
      return res.data;
    },
    refetchOnWindowFocus: false, // Không tự động refetch khi window focus
  });
};
