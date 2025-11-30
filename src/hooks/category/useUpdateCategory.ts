// hooks/category/useUpdateCategory.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
      file,
    }: {
      id: number | string
      data: FormData
      file?: File
    }) => {
      const formDataToSend = data; 

      if (file) {
        formDataToSend.append('image', file);
      }

      const res = await api.put(`/categories/${id}`, formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
      })
      return res.data
    },
  })
}
