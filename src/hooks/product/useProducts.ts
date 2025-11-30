// src/hooks/product/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Product } from '@/types/product.type'; // Đảm bảo import interface Product

interface UseProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export const useProducts = ({
  page = 1,
  limit = 12,
  search = '',
  categoryId,
}: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', page, limit, search, categoryId], 
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { page, limit, search, categoryId}, 
      });
      return {
        data: res.data.data as Product[],
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};