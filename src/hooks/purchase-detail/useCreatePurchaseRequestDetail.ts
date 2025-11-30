import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios'; // Axios instance của bạn

interface CreatePurchaseRequestDetailParams {
  purchaseRequestId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  color: number;
  colorTitle: string;
}

export const useCreatePurchaseRequestDetail = () => {
  return useMutation({
    mutationFn: async (data: CreatePurchaseRequestDetailParams) => {
      const res = await api.post('/purchase-request-details', data);
      return res.data;
    },
  });
};
