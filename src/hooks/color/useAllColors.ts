// src/hooks/color/useAllColors.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Color } from '@/types/color.type';

interface UseAllColorsParams {
  search?: string;
}

export const useAllColors = ({ search = '' }: UseAllColorsParams) => {
  return useQuery({
    queryKey: ['all-colors', search], // Key cho query
    queryFn: async () => {
      const res = await api.get('/colors/all', { // Gọi API endpoint không phân trang
        params: { search },
      });
      return res.data.data as Color[]; // Chỉ trả về mảng màu sắc
    },
  });
};
