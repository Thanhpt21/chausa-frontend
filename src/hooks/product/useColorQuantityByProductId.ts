import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

// Định nghĩa kiểu dữ liệu mới với SIZE
interface ColorQuantity {
  color: number;
  colorTitle: string;           // Tên màu
  size: string;                 // 👈 THÊM SIZE
  importedQuantity: number;     // Số lượng đã nhập
  exportedAndTransferredQuantity: number;  // Số lượng đã xuất
  remainingQuantity: number;    // Số lượng còn lại
}

interface ColorQuantityResponse {
  success: boolean;
  message: string;
  data: ColorQuantity[];        // Thông tin chi tiết về từng màu sắc và size
  totalQuantity: number;        // Tổng số lượng đã nhập
}

// Hook gọi API lấy dữ liệu về số lượng theo màu VÀ SIZE
export const useColorQuantityByProductId = (productId: number) => {
  return useQuery<ColorQuantityResponse>({
    queryKey: ['color-quantity', productId],  // Dùng `productId` làm key cho query
    queryFn: async () => {
      const res = await api.get(`/products/stock/${productId}`); // Gọi API lấy thông tin
      return res.data as ColorQuantityResponse;  // Trả về kiểu dữ liệu đã định nghĩa
    },
    enabled: !!productId, // Chỉ gọi API khi có `productId`
  });
};