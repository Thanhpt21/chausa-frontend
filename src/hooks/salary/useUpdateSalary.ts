import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateSalary = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        month?: number;
        year?: number;
        baseSalary?: number;
        actualWorkDays?: number;
        totalWorkHours?: number;
        overtimeHours?: number;
        overtimeAmount?: number;
        leaveDays?: number;
        leaveHours?: number;
        bonus?: number;
        deduction?: number;
        allowance?: number;
        netSalary?: number;
        status?: string;
        paymentDate?: string;
        notes?: string;
      };
    }) => {
      const res = await api.put(`/salaries/${id}`, data);
      return res.data;
    },
  });
};