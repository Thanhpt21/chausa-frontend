import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeletePurchaseRequestDetail = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      // Gửi yêu cầu DELETE để xóa chi tiết phiếu mua hàng
      const res = await api.delete(`/purchase-request-details/${id}`);
      return res.data;
    },
  });
};