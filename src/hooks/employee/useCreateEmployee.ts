import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateEmployee = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone?: string;
      email?: string;
      position: string;
      department: string;
      baseSalary: number;
      salaryCurrency?: string;
      startDate: string;
      isActive?: boolean;
      bankName?: string;
      bankAccount?: string;
      bankAccountName?: string;
      note?: string;
    }) => {
      const res = await api.post('/employees', data);
      return res.data;
    },
  });
};