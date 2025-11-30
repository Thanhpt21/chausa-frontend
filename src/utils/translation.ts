import { PaymentMethod } from "@/enums/order.enums";

export function getPaymentMethodVietnamese(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.COD:
      return 'Thanh toán khi nhận hàng (COD)'; // Or 'Giao hàng tại nhà'
    case PaymentMethod.Bank:
      return 'Chuyển khoản ngân hàng';
    case PaymentMethod.Momo:
      return 'Ví điện tử Momo';
    default:
      return method;
  }
}