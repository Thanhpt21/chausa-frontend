// src/hooks/supplier/useSupplierOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useSupplierOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['supplier', id],
    queryFn: async () => {
      const res = await api.get(`/suppliers/${id}`); // Đảm bảo API này có thể trả về thông tin của một nhà cung cấp
      return res.data;
    },
  });
};
