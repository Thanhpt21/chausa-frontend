import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteSalary = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/salaries/${id}`);
      return res.data;
    },
  });
};