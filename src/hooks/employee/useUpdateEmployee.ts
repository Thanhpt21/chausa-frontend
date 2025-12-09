import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        name?: string;
        phone?: string;
        email?: string;
        position?: string;
        department?: string;
        baseSalary?: number;
        salaryCurrency?: string;
        startDate?: string;
        isActive?: boolean;
        bankName?: string;
        bankAccount?: string;
        bankAccountName?: string;
        note?: string;
      };
    }) => {
      const res = await api.put(`/employees/${id}`, data);
      return res.data;
    },
  });
};