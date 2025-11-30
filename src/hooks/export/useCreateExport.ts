// src/hooks/export/useCreateExport.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ExportStatus } from '@/types/export.type';

export const useCreateExport = () => {
  return useMutation({
    mutationFn: async (data: {
      userId: number;
      customerId: number;
      note?: string;
      status: ExportStatus
      export_date: string;
      extra_cost?: number;
      additional_cost?: number;
      vat: number;
      pitRate: number;
      isProject?: boolean;
      advancePercent?: number;
    }) => {
      const res = await api.post('/exports', data);
      return res.data;
    },
  });
};
