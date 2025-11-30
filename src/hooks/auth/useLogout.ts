import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout as apiLogout } from '@/lib/auth/logout';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: logoutUser, isPending } = useMutation({
    mutationFn: async () => {
      await apiLogout();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      router.push('/login');
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  return { logoutUser, isPending };
};