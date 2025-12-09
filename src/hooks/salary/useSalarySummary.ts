import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { SalarySummary } from '@/types/salary.type';

export const useSalarySummary = (year: number, month?: number) => {
  return useQuery({
    enabled: !!year,
    queryKey: ['salary-summary', year, month],
    queryFn: async () => {
      const res = await api.get('/salaries/report/summary', {
        params: { year, month },
      });
      return res.data.data as SalarySummary;
    },
  });
};