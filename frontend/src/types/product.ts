// Product types based on backend API
export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promotional_price?: number;
  category: string;
  theme: 'witch' | 'zombie' | 'vampire' | 'skeleton' | 'ghost' | 'cosplay' | 'party' | 'fantasy' | 'retro' | 'punk' | 'elegant' | 'casual' | 'everyday';
  model_url: string;
  thumbnail_url: string;
  image_url?: string;
  image_url_secondary?: string;
  image_url_tertiary?: string;
  image_alt_text?: string;
  image_alt_text_secondary?: string;
  image_alt_text_tertiary?: string;
  ar_image_url?: string;
  stock_quantity: number;
  is_accessory: boolean;
  colors: ProductColor[];
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  theme?: string;
  search?: string;
  is_accessory?: boolean;
}
