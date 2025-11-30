import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios'; // Đảm bảo axios được cấu hình chính xác.

interface TotalAmountResponse {
  totalAmount: number;
  lastUpdate: string | null;
}

export const useTotalAmountForCustomer = (customerId: number) => {
  return useQuery<TotalAmountResponse>({
    enabled: !!customerId, // Khi customerId có giá trị, query sẽ được kích hoạt.
    queryKey: ['totalAmountForCustomer', customerId],
    queryFn: async () => {
      const response = await api.get(`/prepayments/customer/${customerId}/total`);
      return response.data.data; // Giả sử dữ liệu trả về nằm trong trường `data`
    },
    retry: 2, // Retry 2 lần khi có lỗi
  });
};
