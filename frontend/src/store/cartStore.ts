import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem } from '../types/cart';
import { cartService } from '../services/cart.service';

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (item: Omit<CartItem, 'price'>) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number, customizations: CartItem['customizations']) => Promise<void>;
  removeItem: (productId: string, customizations: CartItem['customizations']) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch cart',
        loading: false 
      });
    }
  },

  addItem: async (item) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.addItem(item);
      set({ cart, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to add item to cart',
        loading: false 
      });
      throw error;
    }
  },

  updateItemQuantity: async (productId, quantity, customizations) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.updateItem(productId, quantity, customizations);
      set({ cart, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to update item',
        loading: false 
      });
      throw error;
    }
  },

  removeItem: async (productId, customizations) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.removeItem(productId, customizations);
      set({ cart, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to remove item',
        loading: false 
      });
      throw error;
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await cartService.clearCart();
      set({ cart: { items: [], updatedAt: new Date().toISOString() }, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to clear cart',
        loading: false 
      });
      throw error;
    }
  },

  getCartTotal: () => {
    const { cart } = get();
    if (!cart || !cart.items.length) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getCartItemCount: () => {
    const { cart } = get();
    if (!cart || !cart.items.length) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  },
    }),
    {
      name: 'spooky-styles-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart, // Only persist cart data, not loading/error states
      }),
    }
  )
);
