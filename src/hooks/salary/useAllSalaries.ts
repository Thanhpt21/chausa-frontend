import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { SalaryWithEmployee } from '@/types/salary.type';

interface UseAllSalariesParams {
  year?: number;
  month?: number;
  status?: string;
  employeeId?: number;
}

export const useAllSalaries = ({ 
  year, 
  month, 
  status, 
  employeeId 
}: UseAllSalariesParams = {}) => {
  return useQuery({
    queryKey: ['all-salaries', year, month, status, employeeId],
    queryFn: async () => {
      const res = await api.get('/salaries/all', {
        params: { 
          year, 
          month, 
          status, 
          employeeId 
        },
      });
      return res.data.data as SalaryWithEmployee[];
    },
  });
};