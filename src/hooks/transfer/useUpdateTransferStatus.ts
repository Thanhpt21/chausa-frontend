import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TransferStatus } from '@/types/transfer.type'; // Đảm bảo bạn có enum này

interface UpdateTransferStatusPayload {
  id: number | string;
  status: TransferStatus;
}

export const useUpdateTransferStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: UpdateTransferStatusPayload) => {
      const res = await api.put(`/transfers/${id}/status`, {
        status,
      });
      return res.data;
    },
  });
};
