import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useProductComboOne = (
  comboId?: number | string,
  productId?: number | string,
  enabled: boolean = true
) => {
  return useQuery({
    enabled: !!comboId && !!productId && enabled,
    queryKey: ['product-combo', comboId, productId],
    queryFn: async () => {
      const res = await api.get(`/product-combo/${comboId}/${productId}`);
      return res.data;
    },
  });
};
