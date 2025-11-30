// src/hooks/product/useAllProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Product } from '@/types/product.type'; // Đảm bảo import interface Product

interface UseAllProductsParams {
  search?: string;
  categoryId?: number;
}

export const useAllProducts = ({ search = '', categoryId }: UseAllProductsParams) => {
  return useQuery({
    queryKey: ['all-products', search, categoryId], // Key cho query
    queryFn: async () => {
      const res = await api.get('/products/all', { // Gọi API endpoint không phân trang
        params: { search, categoryId },
      });
      return res.data.data as Product[]; // Chỉ trả về mảng sản phẩm
    },
  });
};
