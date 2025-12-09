import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteEmployee = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/employees/${id}`);
      return res.data;
    },
  });
};