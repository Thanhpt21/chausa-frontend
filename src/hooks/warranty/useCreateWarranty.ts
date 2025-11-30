// src/hooks/warranty/useCreateWarranty.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface CreateWarrantyPayload {
  title: string;
  model: string;
  colorTitle: string;
  quantity: number;
  note: string;
  isResolved?: boolean;
}

export const useCreateWarranty = () => {
  return useMutation({
    mutationFn: async (data: CreateWarrantyPayload) => {
      const res = await api.post('/warranty', data);
      return res.data;
    },
  });
};