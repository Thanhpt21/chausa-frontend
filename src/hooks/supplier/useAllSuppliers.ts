// src/hooks/supplier/useAllSuppliers.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Supplier } from '@/types/supplier.type'; // Đảm bảo import interface Supplier

interface UseAllSuppliersParams {
  search?: string;
}

export const useAllSuppliers = ({ search = '' }: UseAllSuppliersParams) => {
  return useQuery({
    queryKey: ['all-suppliers', search], // Key cho query
    queryFn: async () => {
      const res = await api.get('/suppliers/all', { // Gọi API endpoint không phân trang
        params: { search },
      });
      return res.data.data as Supplier[]; // Chỉ trả về mảng nhà cung cấp
    },
  });
};
