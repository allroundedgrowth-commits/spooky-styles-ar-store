// Costume inspiration types based on backend API
export interface CostumeInspiration {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface InspirationProduct {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  promotional_price: number | null;
  category: string;
  theme: string;
  model_url: string;
  thumbnail_url: string;
  stock_quantity: number;
  is_accessory: boolean;
  display_order: number;
}

export interface InspirationWithProducts extends CostumeInspiration {
  products: InspirationProduct[];
}
