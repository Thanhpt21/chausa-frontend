// src/hooks/inventory/useInventoryByProductId.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useInventoryByProductId = (productId?: number) => {
  return useQuery({
    queryKey: ['inventory-by-product', productId],
    enabled: !!productId, // chỉ gọi API khi productId hợp lệ
    queryFn: async () => {
      const res = await api.get(`/inventory/product/${productId}`);
      return res.data;
    },
    refetchOnWindowFocus: false,  // Không tự động refetch khi window focus
  });
};
