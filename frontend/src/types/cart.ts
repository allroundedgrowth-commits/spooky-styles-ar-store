// Cart types based on backend API
export interface CartItemCustomization {
  color?: string;
  accessories?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  customizations: CartItemCustomization;
  price: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

export interface CartTotal {
  total: number;
}
