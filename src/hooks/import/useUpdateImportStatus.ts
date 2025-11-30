// src/hooks/import/useUpdateImportStatus.ts

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ImportStatus } from '@/types/import.type'; // Giả sử bạn đã có ImportStatus trong types

interface UpdateImportStatusPayload {
  id: number | string;
  status: ImportStatus;
}

export const useUpdateImportStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: UpdateImportStatusPayload) => {
      const res = await api.put(`/imports/${id}/status`, { status });
      return res.data;
    },
  });
};
