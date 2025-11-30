// hooks/combo-product/useProductCombo.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useProductCombo = (comboId?: number | string, enabled: boolean = true) => {
  return useQuery({
    enabled: !!comboId && enabled,
    queryKey: ['product-combo', comboId],
    queryFn: async () => {
      const res = await api.get(`/product-combo/by-combo/${comboId}`); // CHỖ NÀY ĐÃ ĐỔI
      return res.data;
    },
  });
};
