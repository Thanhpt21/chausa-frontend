import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteProductCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ comboId, productId }: { comboId: number; productId: number }) => {
      const res = await api.delete(`/product-combo/${comboId}/${productId}`);
      return res.data;
    },
  });
};
