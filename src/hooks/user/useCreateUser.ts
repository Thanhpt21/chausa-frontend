import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

//k nên xài, vì dùng auth register
export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: any) => {  
      const res = await api.post('/users', data)
      return res.data
    },
  })
}
