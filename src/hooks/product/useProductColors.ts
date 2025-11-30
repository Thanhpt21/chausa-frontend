// src/hooks/product/useProductColors.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseProductColorsParams {
  productId: number;
}

export const useProductColors = ({ productId }: UseProductColorsParams) => {
  return useQuery({
    queryKey: ['product-colors', productId], // Key cho query, sử dụng productId để cache
    queryFn: async () => {
      const res = await api.get(`/products/${productId}/colors`); // Gọi API lấy màu sắc của sản phẩm
      return res.data.data; // Dữ liệu trả về sẽ là mảng màu sắc
    },
  });
};
