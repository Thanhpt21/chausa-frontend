export interface PurchaseRequestDetail {
  id: number;
  purchaseRequestId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  color: number;
  colorTitle: string;
  product: {
    title: string;
    sku: string;
    unit: string;
  };
}
