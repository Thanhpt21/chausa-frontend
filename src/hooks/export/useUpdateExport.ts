// src/hooks/export/useUpdateExport.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ExportStatus } from '@/types/export.type';

export const useUpdateExport = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        note?: string;
        status?: ExportStatus
        total_amount?: number;
        export_date?: string;
        extra_cost?: number;
        additional_cost?: number;
        prepaymentId?: number | null;
        vat?: number;
        pitRate?: number;
      };
    }) => {
      const res = await api.put(`/exports/${id}`, data);
      return res.data;
    },
  });
};
