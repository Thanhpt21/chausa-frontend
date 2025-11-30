// src/hooks/export-detail/useUpdateProjectCategoryOrder.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

type UpdateProjectCategoryOrderPayload = {
  exportId: number;
  projectCategoryId: number | null;
  projectCategoryOrder: number;
};

export const useUpdateProjectCategoryOrder = () => {
  return useMutation({
    mutationFn: async (payload: UpdateProjectCategoryOrderPayload) => {
      const res = await api.put('/export-details/update-category-order', payload);
      return res.data;
    },
  });
};