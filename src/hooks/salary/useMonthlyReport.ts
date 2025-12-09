import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { MonthlyReport } from '@/types/salary.type';

export const useMonthlyReport = (year: number, month: number) => {
  return useQuery({
    enabled: !!year && !!month,
    queryKey: ['monthly-report', year, month],
    queryFn: async () => {
      const res = await api.get('/salaries/report/monthly', {
        params: { year, month },
      });
      return res.data.data as MonthlyReport;
    },
  });
};