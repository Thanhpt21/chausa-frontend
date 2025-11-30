import { Product } from './product.type';

export interface PurchaseRequest {
  id: number;
  note?: string;
  status: PurchaseRequestStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
  total_amount: number;
  supplierId: number;
  purchase_date: string;

  supplier: {                     
    id: number;
    name: string;
    phoneNumber: string;             
    email: string;                  
    address: string;                 
    mst: string
  };


  details?: {
    id: number;
    quantity: number;
    unitPrice: number;
    product: Product;
    note?: string;
    colorTitle?: string;
  }[];
}

export enum PurchaseRequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
