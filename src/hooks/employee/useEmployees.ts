import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { EmployeeWithSalaries } from '@/types/employee.type';

interface UseEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  isActive?: boolean;
}

export const useEmployees = ({
  page = 1,
  limit = 10,
  search = '',
  department = '',
  isActive,
}: UseEmployeesParams) => {
  return useQuery({
    queryKey: ['employees', page, limit, search, department, isActive],
    queryFn: async () => {
      const res = await api.get('/employees', {
        params: { 
          page, 
          limit, 
          search, 
          department, 
          isActive 
        },
      });

      return {
        data: res.data.data as EmployeeWithSalaries[],
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};