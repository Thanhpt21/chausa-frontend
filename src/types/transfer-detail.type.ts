export interface TransferDetail {
  id: number;
  transferId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalPrice: number;
  vat: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  color: number;
  colorTitle: string;
  product: {
    title: string;
    sku: string;
    unit: string;
  };
  transfer: {
    id: number;
    transfer_date: string;
  };
}
