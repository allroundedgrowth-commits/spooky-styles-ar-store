import api from './apiService';
import { Cart, CartItem, CartTotal } from '../types/cart';

/**
 * Cart Service
 * Uses the new API integration layer with automatic loading states and error handling
 */
export const cartService = {
  // Get current cart
  async getCart(): Promise<Cart> {
    return await api.cart.getCart();
  },

  // Add item to cart
  async addItem(item: Omit<CartItem, 'price'>): Promise<Cart> {
    return await api.cart.addItem(item);
  },

  // Update item quantity
  async updateItem(productId: string, quantity: number, customizations: CartItem['customizations']): Promise<Cart> {
    return await api.cart.updateItem(productId, quantity, customizations);
  },

  // Remove item from cart
  async removeItem(productId: string, customizations: CartItem['customizations']): Promise<Cart> {
    return await api.cart.removeItem(productId, customizations);
  },

  // Clear cart
  async clearCart(): Promise<void> {
    return await api.cart.clearCart();
  },

  // Get cart total
  async getTotal(): Promise<CartTotal> {
    return await api.cart.getTotal();
  },
};
