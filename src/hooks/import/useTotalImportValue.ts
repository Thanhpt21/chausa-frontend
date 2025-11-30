// src/hooks/import/useTotalImportValue.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface TotalImportValueData {
  totalImportValue: number;
}

interface UseTotalImportValueParams {
  startDate?: string;
  endDate?: string;
}

export const useTotalImportValue = ({ startDate, endDate }: UseTotalImportValueParams) => {
  return useQuery<TotalImportValueData>({
    queryKey: ['total-import-value', startDate, endDate], // Thêm startDate và endDate vào queryKey để làm mới khi chúng thay đổi
    queryFn: async () => {
      const params = {
        ...(startDate && { startDate }), // Nếu có startDate, thêm vào params
        ...(endDate && { endDate }),     // Nếu có endDate, thêm vào params
      };
      const res = await api.get('/imports/total-value', { params });
      return res.data.data as TotalImportValueData;
    },
  });
};
