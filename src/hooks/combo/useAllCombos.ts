// src/hooks/combo/useAllCombos.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Combo } from '@/types/combo.type';

interface UseAllCombosParams {
  search?: string;
}

export const useAllCombos = ({ search = '' }: UseAllCombosParams) => {
  return useQuery({
    queryKey: ['all-combos', search], // Key cho query
    queryFn: async () => {
      const res = await api.get('/combo/all', { // API endpoint lấy danh sách combo không phân trang
        params: { search },
      });
      return res.data.data as Combo[]; // Trả về mảng combo
    },
  });
};
