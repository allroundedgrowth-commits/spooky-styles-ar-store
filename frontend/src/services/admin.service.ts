import { apiClient } from './api';
import { Product } from '../types/product';

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  category: string;
  theme: string;
  model_url?: string;
  thumbnail_url: string;
  image_url: string;
  ar_image_url: string;
  stock_quantity?: number;
  is_accessory?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  promotional_price?: number;
  category?: string;
  theme?: string;
  model_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  ar_image_url?: string;
  stock_quantity?: number;
  is_accessory?: boolean;
}

export interface LowStockAlert {
  products: Product[];
  count: number;
  threshold: number;
  message: string;
}

class AdminService {
  async createProduct(input: CreateProductInput): Promise<Product> {
    const response = await apiClient.post('/products', input);
    return response.data.data;
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, input);
    return response.data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  async getLowStockProducts(threshold: number = 10): Promise<LowStockAlert> {
    const response = await apiClient.get(`/products/alerts/low-stock?threshold=${threshold}`);
    return {
      products: response.data.data,
      count: response.data.count,
      threshold: response.data.threshold,
      message: response.data.message,
    };
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products/alerts/out-of-stock');
    return response.data.data;
  }

  async addProductColor(productId: string, colorName: string, colorHex: string): Promise<void> {
    await apiClient.post(`/products/${productId}/colors`, {
      color_name: colorName,
      color_hex: colorHex,
    });
  }

  async deleteProductColor(colorId: string): Promise<void> {
    await apiClient.delete(`/products/colors/${colorId}`);
  }
}

export default new AdminService();
