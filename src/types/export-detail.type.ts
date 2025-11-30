export interface ExportDetail {
 id: number;
  exportId: number;
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
  colorTitle: string,
  projectCategoryId: number | null;
  projectCategoryOrder: number | null;
  projectCategoryTitle: string | null;
  product: {
    title: string;
    sku: string;
    unit: string;
    description: string; 
  };
  export: {
    id: number;
    export_date: string;
  };
}
