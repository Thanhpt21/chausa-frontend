// src/hooks/product/useUpdateProduct.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateProductPayload {
    id: number;
    data: FormData; // Data là FormData
}

export const useUpdateProduct = () => {
    return useMutation({
        mutationFn: async (payload: UpdateProductPayload) => {
            const res = await api.put(`/products/${payload.id}`, payload.data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
    });
};