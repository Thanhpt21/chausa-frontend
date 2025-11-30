export interface ImportDetail {
  id: number;
  importId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  color: number;
  colorTitle: string,
  product: {
    title: string;
  };
}