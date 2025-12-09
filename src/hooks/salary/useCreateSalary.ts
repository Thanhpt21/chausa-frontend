import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateSalary = () => {
  return useMutation({
    mutationFn: async (data: {
      employeeId: number;
      month: number;
      year: number;
      baseSalary: number;
      actualWorkDays: number;
      totalWorkHours?: number;
      overtimeHours?: number;
      overtimeAmount?: number;
      leaveDays?: number;
      leaveHours?: number;
      bonus?: number;
      deduction?: number;
      allowance?: number;
      netSalary: number;
      status?: string;
      paymentDate?: string;
      notes?: string;
    }) => {
      const res = await api.post('/salaries', data);
      return res.data;
    },
  });
};