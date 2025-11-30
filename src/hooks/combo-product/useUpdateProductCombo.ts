import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateProductCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      comboId: number;
      productId: number;
      quantity?: number;
      unitPrice?: number;
      color?: number;
      colorTitle?: string;
      unit?: string;
      finalPrice?: number;
      note?: string;
    }) => {
      const res = await api.put(`/product-combo/${data.comboId}/${data.productId}`, data);
      return res.data;
    },
   
  });
};
