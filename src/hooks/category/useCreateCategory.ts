// hooks/category/useCreateCategory.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateCategory = () => {
  return useMutation({
    // Thay đổi kiểu của tham số 'data' thành FormData
    mutationFn: async (formData: FormData) => { 
      // Không cần tạo FormData mới hay lặp qua entries ở đây nữa.
      // formData đã chứa tất cả dữ liệu từ frontend.
      const res = await api.post('/categories', formData, {
        headers: { 
          // 'Content-Type': 'multipart/form-data' thường được tự động thiết lập 
          // khi bạn gửi một đối tượng FormData, nhưng thêm vào cũng không hại.
          'Content-Type': 'multipart/form-data' 
        },
      });
      return res.data;
    },
  });
};
