// src/types/prepayment.type.ts

export interface Prepayment {
  id: number; // ID của phiếu thanh toán
  customerId: number; // ID của khách hàng
  customerName: string; // Tên khách hàng (có thể lấy từ bảng Customer)
  amountMoney: number; // Số tiền thanh toán trước
  date: string; // Ngày thanh toán
  note?: string; // Ghi chú (tuỳ chọn)
  createdAt: string; // Ngày tạo
  updatedAt: string; // Ngày cập nhật
  status: PrepaymentStatus
}

export type PrepaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
