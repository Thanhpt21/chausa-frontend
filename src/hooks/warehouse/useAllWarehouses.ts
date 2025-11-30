// src/hooks/warehouse/useAllWarehouses.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Warehouse } from '@/types/warehouse.type'; // Đảm bảo import interface Warehouse

interface UseAllWarehousesParams {
  search?: string;
}

export const useAllWarehouses = ({ search = '' }: UseAllWarehousesParams) => {
  return useQuery({
    queryKey: ['all-warehouses', search], // Key cho query
    queryFn: async () => {
      const res = await api.get('/warehouses/all', { // Gọi API endpoint không phân trang
        params: { search },
      });
      return res.data.data as Warehouse[]; // Chỉ trả về mảng kho hàng
    },
  });
};
