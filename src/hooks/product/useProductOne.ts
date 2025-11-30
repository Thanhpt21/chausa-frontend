// src/hooks/product/useProductOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ProductResponse } from '@/types/product.type';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const useProductOne = (id: number | string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ProductResponse>>(`/products/id/${id}`);
      return res.data.data; // Trả về trực tiếp product data từ response
    },
    enabled: !!id,
  });
};

// types/product.type.ts (ví dụ, bạn cần định nghĩa ProductResponse)
