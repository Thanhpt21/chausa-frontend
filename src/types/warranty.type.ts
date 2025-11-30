export type Warranty = {
  id: number;
  note: string;
  isResolved: boolean;
  quantity: number;
  colorTitle: string;
  title: string;    // Tên sản phẩm
  model: string;    // Mã model sản phẩm
  createdAt: Date;
  updatedAt: Date;
};