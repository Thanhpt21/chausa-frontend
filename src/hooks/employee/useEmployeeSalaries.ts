import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { EmployeeSalary } from '@/types/employee.type';

export const useEmployeeSalaries = (employeeId?: number | string) => {
  return useQuery({
    enabled: !!employeeId,
    queryKey: ['employee-salaries', employeeId],
    queryFn: async () => {
      const res = await api.get(`/employees/${employeeId}/salaries`);
      return res.data.data.salaries as EmployeeSalary[];
    },
  });
};