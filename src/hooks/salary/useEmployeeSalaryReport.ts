import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { EmployeeSalaryReport } from '@/types/salary.type';

export const useEmployeeSalaryReport = (employeeId?: number | string, year?: number) => {
  return useQuery({
    enabled: !!employeeId,
    queryKey: ['employee-salary-report', employeeId, year],
    queryFn: async () => {
      const res = await api.get(`/salaries/report/employee/${employeeId}`, {
        params: { year },
      });
      return res.data.data as EmployeeSalaryReport;
    },
  });
};