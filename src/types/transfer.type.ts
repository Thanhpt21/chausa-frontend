import { Product } from "./product.type";

export interface Transfer {
  id: number;                       // ID của phiếu chuyển kho
  createdAt: string;                // Thời gian tạo phiếu chuyển
  updatedAt: string;                // Thời gian cập nhật phiếu chuyển
  userId: number;                  // ID người tạo phiếu chuyển
  customerId: number;              // ID khách hàng liên quan
  note?: string;                   // Ghi chú (nếu có)
  status: TransferStatus;          // Trạng thái phiếu chuyển
  total_amount: number;            // Tổng tiền chuyển kho
  transfer_date: string;           // Ngày chuyển kho
  isInternal: boolean;

  user: {                         // Thông tin người dùng tạo phiếu
    id: number;
    name: string;
  };

  customer: {                     // Thông tin khách hàng
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
    mst?: string;                 // Mã số thuế (nếu có)
    loyaltyPoint?: number;
  };

  transferDetails?: {             // Chi tiết các sản phẩm chuyển
    id: number;
    description: string;          // Mô tả sản phẩm
    model: string;                // Mã model sản phẩm
    quantity: number;             // Số lượng chuyển
    unitPrice: number;            // Đơn giá sản phẩm
    totalPrice: number;           // Thành tiền = quantity * unitPrice
    note?: string;                // Ghi chú (nếu có)
    product: Product;             // Thông tin sản phẩm
    colorTitle?: string;          // Màu sắc (nếu có)
    discountPercent?: number;     // Phần trăm giảm giá (nếu có)
    finalPrice: number;           // Giá cuối cùng sau giảm giá
  }[];
}

export enum TransferStatus {
  PENDING = 'PENDING',           
  EXPORTED = 'EXPORTED',
  PREPARED = 'PREPARED',    
  CANCELLED = 'CANCELLED',        
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}
