import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Employee } from '@/types/employee.type';

interface UseAllEmployeesParams {
  search?: string;
  department?: string;
  isActive?: boolean;
}

export const useAllEmployees = ({ 
  search = '', 
  department = '', 
  isActive 
}: UseAllEmployeesParams = {}) => {
  return useQuery({
    queryKey: ['all-employees', search, department, isActive],
    queryFn: async () => {
      const res = await api.get('/employees/all', {
        params: { 
          search, 
          department, 
          isActive 
        },
      });
      return res.data.data as Employee[];
    },
  });
};