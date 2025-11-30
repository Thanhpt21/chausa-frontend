// src/types/order/enums.ts

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Preparing = 'preparing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Returned = 'returned',
}

export enum PaymentMethod {
  COD = 'COD',
  Bank = 'Bank',
  Momo = 'Momo',
}