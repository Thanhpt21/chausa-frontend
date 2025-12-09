import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { EmployeeWithSalaries } from '@/types/employee.type';

export const useEmployeeOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['employee', id],
    queryFn: async () => {
      const res = await api.get(`/employees/${id}`);
      return res.data.data as EmployeeWithSalaries;
    },
  });
};