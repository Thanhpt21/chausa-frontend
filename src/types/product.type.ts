import { WeightUnit } from "@/enums/product.enums";

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  sku: string;
  thumb: string;
  price: number;
  discount: number;
  discountSingle?: number;
  discountMultiple?: number; 
  createdAt: Date;
  updatedAt: Date;
  categoryId?: number | null;
  category?: Category | null; // Assuming you have a Category interface
  weight?: number | null; // Khối lượng sản phẩm
  weightUnit?: WeightUnit | null; // Đơn vị khối lượng (ví dụ: 'kg', 'gram')
  unit?: string | null; // Đơn vị tính (ví dụ: 'cái', 'hộp')
  quantity: number;
  colors?: { 
    colorId: number;
    quantity: number;
    title: string
  }[];
  stock?: {
    totalImported: number;
    totalExported: number;
    remainingQuantity: number;
  };

  stockByColor?: {
    color: number;
    colorTitle: string;
    importedQuantity: number;
    exportedAndTransferredQuantity: number;
    remainingQuantity: number;
  }[];

  // ✅ (Nếu bạn cần dùng totalImported / totalExportedAndTransferred / totalRemaining cũng nên khai báo)
  totalImported?: number;
  totalExportedAndTransferred?: number;
  totalRemaining?: number;
}

export interface Category {
  id: number
  title: string
  slug: string
  image: string | null
  createdAt: string
  updatedAt: string
  parentId?: number | null // Thêm parentId
  children?: Category[];
}



export interface ProductCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
  categories: Category[];

}

export interface ProductUpdateModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  refetch: () => void;
  categories: Category[];
}

export interface ProductResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  sku: string;
  thumb: string;
  price: number;
  discount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category: { id: number; title: string };
  weight: number | null; // API có thể trả về null nếu không có
  weightUnit: WeightUnit | null; // API có thể trả về null nếu không có
  unit: string | null; // API có thể trả về null nếu không có
}



