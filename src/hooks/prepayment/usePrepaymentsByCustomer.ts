import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Prepayment } from '@/types/prepayment.type';


interface PrepaymentByCustomerResponse {
  success: boolean;
  message: string;
  data: Prepayment[];
}

export const usePrepaymentsByCustomer = (customerId: number | string, options?: { enabled?: boolean }) => {
  return useQuery<PrepaymentByCustomerResponse>({
    queryKey: ['prepayments', customerId],
    queryFn: async () => {
      const response = await api.get(`/prepayments/customer/${customerId}`);
      return response.data;
    },
       enabled: options?.enabled ?? !!customerId, // allow overriding
  });
};
