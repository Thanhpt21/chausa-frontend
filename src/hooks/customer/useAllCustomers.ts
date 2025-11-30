// src/hooks/customer/useAllCustomers.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Customer } from '@/types/customer.type'; // Đảm bảo import interface Customer

interface UseAllCustomersParams {
  search?: string;
}

export const useAllCustomers = ({ search = '' }: UseAllCustomersParams) => {
  return useQuery({
    queryKey: ['all-customers', search], // Key cho query
    queryFn: async () => {
      const res = await api.get('/customers/all', { // Gọi API endpoint không phân trang
        params: { search },
      });
      return res.data.data as Customer[]; // Chỉ trả về mảng khách hàng
    },
  });
};
