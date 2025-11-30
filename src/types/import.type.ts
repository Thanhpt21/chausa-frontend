import { Product } from "./product.type";

export interface Import {
  id: number;
  note?: string;
  status: ImportStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
  total_amount: number;
  supplierId: number; 
  import_date: string

  supplier: {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
    mst?: string;
  };

  importDetails?: {
    id: number;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    finalPrice: number;           
    product: Product;
    note?: string;
    colorTitle?: string;
  }[];

  isInternal: boolean;      
  extra_cost?: number;      

}

export enum ImportStatus {
  PENDING = 'PENDING',              
  COMPLETED = 'COMPLETED',            
  CANCELLED = 'CANCELLED',          
}


