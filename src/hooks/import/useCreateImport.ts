// src/hooks/import/useCreateImport.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateImport = () => {
  return useMutation({
    mutationFn: async (data: {
      note?: string;
      status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    }) => {
      const res = await api.post('/imports', data);
      return res.data;
    },
  });
};
