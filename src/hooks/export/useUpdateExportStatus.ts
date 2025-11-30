// src/hooks/export/useUpdateExportStatus.ts

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ExportStatus } from '@/types/export.type';

interface UpdateExportStatusPayload {
  id: number | string;
  status: ExportStatus;
}

export const useUpdateExportStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: UpdateExportStatusPayload) => {
      const res = await api.put(`/exports/${id}/status`, { 
        status, 
      });
      return res.data;
    },
  });
};
