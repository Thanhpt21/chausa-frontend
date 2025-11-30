// src/types/combo.type.ts

import { Product } from './product.type'

export interface ComboProduct {
  id: number;
  comboId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  unit: string;
  color: number;
  colorTitle: string;
  note: string;
  product: {
    id: number;
    title: string;
    sku?: string;
    price?: number;
    unit?: string;
    colors?: {
      id: number;
      title: string;
    }[];
  };
}

export interface Combo {
  id: number
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  products?: ComboProduct[]
}