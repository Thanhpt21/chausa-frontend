import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { SalaryWithEmployee } from '@/types/salary.type';

export const useSalaryOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['salary', id],
    queryFn: async () => {
      const res = await api.get(`/salaries/${id}`);
      return res.data.data as SalaryWithEmployee;
    },
  });
};