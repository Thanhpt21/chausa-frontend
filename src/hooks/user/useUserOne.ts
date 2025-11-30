import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUserOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await api.get(`/users/${id}`)
      return res.data
    },
  })
}
