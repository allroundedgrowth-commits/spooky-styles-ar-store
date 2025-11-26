import api from './apiService';
import { Product, ProductFilters } from '../types/product';

/**
 * Product Service
 * Uses the new API integration layer with automatic loading states and error handling
 */
export const productService = {
  // Get all products with optional filters
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return await api.products.getProducts(filters);
  },

  // Search products by keyword
  async searchProducts(keyword: string): Promise<Product[]> {
    return await api.products.searchProducts(keyword);
  },

  // Get single product by ID
  async getProductById(id: string): Promise<Product> {
    return await api.products.getProductById(id);
  },

  // Admin methods
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return await api.products.createProduct(product);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return await api.products.updateProduct(id, updates);
  },

  async deleteProduct(id: string): Promise<void> {
    return await api.products.deleteProduct(id);
  },
};
