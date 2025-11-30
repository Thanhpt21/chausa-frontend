import { PrepaymentStatus } from "./prepayment.type";
import { Product } from "./product.type";

export interface Export {
  id: number;                       // ID của bản ghi xuất
  createdAt: string;                 // Thời gian tạo bản ghi xuất
  updatedAt: string;                 // Thời gian cập nhật bản ghi xuất
  userId: number;                   // ID của người dùng thực hiện xuất
  customerId: number;               // ID của khách hàng liên quan
  prepaymentId?: number;            // ID của phiếu tạm ứng (nếu có)
  note?: string;                    // Ghi chú (nếu có)
  status: ExportStatus;             // Trạng thái của đơn xuất
  total_amount: number;              // Tổng số tiền xuất (trước thuế VAT)
  export_date: string;               // Ngày xuất hàng


  extra_cost?: number;              // Chi phí phụ (mặc định là 0)
  additional_cost?: number;         // Chi phí bổ sung (mặc định là 0)
  vat?: number;                     // Tỷ lệ VAT
  pitRate?: number;                     // Tỷ lệ VAT TNCN

  vat_amount?: number;              // Số tiền thuế VAT (tính từ vat * total_amount)
  pitRate_amount?: number;              // Số tiền thuế VAT (tính từ pitRate * total_amount)
  grand_total: number;              // Tổng số tiền sau thuế (grand_total = total_amount + vat_amount)
  prepayment_amount: number;

  applyLoyaltyPoint?: boolean;        // Có áp dụng điểm thành viên hay không
  loyaltyPointUsed?: number;          // Số điểm thành viên đã sử dụng
  loyaltyPointAmount?: number;        // Số tiền được giảm từ điểm thành viên

  isProject?: boolean;                 // true = báo giá thi công/lắp đặt
  advancePercent?: number;            // phần trăm tạm ứng (0–100) 

  user: {                           // Thông tin người dùng liên quan đến bản ghi xuất
    id: number;
    name: string;
  };

  customer: {                        // Thông tin khách hàng liên quan đến bản ghi xuất
    id: number;
    name: string;
    phoneNumber: string;             // Số điện thoại khách hàng
    email: string;                   // Email khách hàng
    address: string;                 // Địa chỉ giao hàng
    mst: string
    loyaltyPoint: number
  };

  prepayment?: {                     // Thông tin phiếu tạm ứng (nếu có)
    id: number;
    amount: number;                  // Số tiền tạm ứng
    status: PrepaymentStatus
  };

  exportDetails?: {
    id: number;                       // Chi tiết mặt hàng xuất (nếu có)
    description: string;             // Mô tả sản phẩm
    model: string;                   // Mã model sản phẩm
    quantity: number;                // Số lượng sản phẩm
    unitPrice: number;               // Đơn giá của sản phẩm
    totalPrice: number;              // Thành tiền của sản phẩm (quantity * unitPrice)
    note?: string;   
    product: Product                // Ghi chú cho mặt hàng (nếu có)
    colorTitle: string;
    discountPercent: number;
    finalPrice: number;
    projectCategoryId: number | null;
    projectCategoryOrder: number | null;
    projectCategoryTitle: string | null;
  }[];

}

export enum ExportStatus {
  PENDING = 'PENDING',               // Chờ xử lý
  EXPORTED = 'EXPORTED',             // Đã xuất kho
  CANCELLED = 'CANCELLED',           // Đã huỷ
  REJECTED = 'REJECTED',             // Khách hàng từ chối
  RETURNED = 'RETURNED',             // Đổi trả hàng
  COMPLETED = 'COMPLETED',
  PREPARED = 'PREPARED',
  EXPIRED = 'EXPIRED'
}
