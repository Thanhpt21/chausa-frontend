import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { SalaryWithEmployee } from '@/types/salary.type';

interface UseSalariesParams {
  page?: number;
  limit?: number;
  year?: number;
  month?: number;
  status?: string;
  employeeId?: number;
}

export const useSalaries = ({
  page = 1,
  limit = 10,
  year,
  month,
  status,
  employeeId,
}: UseSalariesParams) => {
  return useQuery({
    queryKey: ['salaries', page, limit, year, month, status, employeeId],
    queryFn: async () => {
      const res = await api.get('/salaries', {
        params: { 
          page, 
          limit, 
          year, 
          month, 
          status, 
          employeeId 
        },
      });

      return {
        data: res.data.data as SalaryWithEmployee[],
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};