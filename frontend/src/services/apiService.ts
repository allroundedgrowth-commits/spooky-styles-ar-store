import { apiClient, apiCall } from './api';
import { Product, ProductFilters } from '../types/product';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../types/user';
import { Cart, CartItem } from '../types/cart';
import { Order } from '../types/order';

// Order creation request type
export interface OrderCreateRequest {
  paymentIntentId: string;
}

/**
 * Comprehensive API Service with typed methods for all endpoints
 * Includes loading state management and error handling
 */

// ============================================================================
// Authentication API
// ============================================================================

export const authAPI = {
  /**
   * Register a new user account
   */
  register: async (data: RegisterRequest) => {
    const response = await apiCall<{ token: string; user: any; data?: AuthResponse }>('auth.register', () =>
      apiClient.post('/auth/register', data)
    );
    // Handle both response formats for backward compatibility
    if (response.data) {
      return response.data;
    }
    return { token: response.token, user: response.user };
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest) => {
    const response = await apiCall<{ token: string; user: any; data?: AuthResponse }>('auth.login', () =>
      apiClient.post('/auth/login', data)
    );
    // Handle both response formats for backward compatibility
    if (response.data) {
      return response.data;
    }
    return { token: response.token, user: response.user };
  },

  /**
   * Logout current user
   */
  logout: () =>
    apiCall<void>('auth.logout', () =>
      apiClient.post('/auth/logout')
    ),

  /**
   * Get current authenticated user
   */
  getCurrentUser: () =>
    apiCall<{ data: User }>('auth.getCurrentUser', () =>
      apiClient.get('/auth/me')
    ).then(res => res.data),

  /**
   * Update user profile
   */
  updateProfile: (updates: Partial<User>) =>
    apiCall<{ data: User }>('auth.updateProfile', () =>
      apiClient.put('/auth/profile', updates)
    ).then(res => res.data),
};

// ============================================================================
// Product API
// ============================================================================

export const productAPI = {
  /**
   * Get all products with optional filters
   */
  getProducts: async (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.theme) params.append('theme', filters.theme);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_accessory !== undefined) {
      params.append('is_accessory', filters.is_accessory.toString());
    }

    const response = await apiCall<{ success: boolean; data: Product[] }>('products.getAll', () =>
      apiClient.get(`/products?${params.toString()}`)
    );
    return response.data || [];
  },

  /**
   * Search products by keyword
   */
  searchProducts: async (keyword: string) => {
    const response = await apiCall<{ success: boolean; data: Product[] }>('products.search', () =>
      apiClient.get(`/products/search?q=${encodeURIComponent(keyword)}`)
    );
    return response.data || [];
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id: string) => {
    const response = await apiCall<{ success: boolean; data: Product }>(`products.getById.${id}`, () =>
      apiClient.get(`/products/${id}`)
    );
    return response.data;
  },

  /**
   * Create new product (admin only)
   */
  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiCall<{ success: boolean; data: Product }>('products.create', () =>
      apiClient.post('/products', product)
    );
    return response.data;
  },

  /**
   * Update existing product (admin only)
   */
  updateProduct: async (id: string, updates: Partial<Product>) => {
    const response = await apiCall<{ success: boolean; data: Product }>(`products.update.${id}`, () =>
      apiClient.put(`/products/${id}`, updates)
    );
    return response.data;
  },

  /**
   * Delete product (admin only)
   */
  deleteProduct: (id: string) =>
    apiCall<void>(`products.delete.${id}`, () =>
      apiClient.delete(`/products/${id}`)
    ),
};

// ============================================================================
// Cart API
// ============================================================================

export const cartAPI = {
  /**
   * Get current user's cart
   */
  getCart: async () => {
    const response = await apiCall<{ success: boolean; data: Cart }>('cart.get', () =>
      apiClient.get('/cart')
    );
    return response.data;
  },

  /**
   * Add item to cart
   */
  addItem: async (item: Omit<CartItem, 'price'>) => {
    const response = await apiCall<{ success: boolean; data: Cart }>('cart.addItem', () =>
      apiClient.post('/cart/items', item)
    );
    return response.data;
  },

  /**
   * Update cart item quantity and customizations
   */
  updateItem: async (productId: string, quantity: number, customizations: CartItem['customizations']) => {
    const response = await apiCall<{ success: boolean; data: Cart }>(`cart.updateItem.${productId}`, () =>
      apiClient.put(`/cart/items/${productId}`, { quantity, customizations })
    );
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeItem: async (productId: string, customizations: CartItem['customizations']) => {
    const response = await apiCall<{ success: boolean; data: Cart }>(`cart.removeItem.${productId}`, () =>
      apiClient.delete(`/cart/items/${productId}`, { data: { customizations } })
    );
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: () =>
    apiCall<void>('cart.clear', () =>
      apiClient.delete('/cart')
    ),

  /**
   * Get cart total
   */
  getTotal: () =>
    apiCall<{ total: number }>('cart.getTotal', () =>
      apiClient.get('/cart/total')
    ),
};

// ============================================================================
// Order API
// ============================================================================

export const orderAPI = {
  /**
   * Create new order from cart
   */
  createOrder: async (orderData: OrderCreateRequest) => {
    const response = await apiCall<{ success: boolean; data: Order }>('orders.create', () =>
      apiClient.post('/orders', orderData)
    );
    return response.data;
  },

  /**
   * Get user's order history
   */
  getOrders: async () => {
    const response = await apiCall<{ success: boolean; data: Order[] }>('orders.getAll', () =>
      apiClient.get('/orders')
    );
    return response.data;
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (id: string) => {
    const response = await apiCall<{ success: boolean; data: Order }>(`orders.getById.${id}`, () =>
      apiClient.get(`/orders/${id}`)
    );
    return response.data;
  },

  /**
   * Update order status (admin only)
   */
  updateOrderStatus: async (id: string, status: Order['status']) => {
    const response = await apiCall<{ success: boolean; data: Order }>(`orders.updateStatus.${id}`, () =>
      apiClient.put(`/orders/${id}/status`, { status })
    );
    return response.data;
  },

  /**
   * Get order by payment intent ID (public endpoint for guest checkout)
   */
  getOrderByPaymentIntent: async (paymentIntentId: string) => {
    const response = await apiCall<{ success: boolean; data: Order }>(`orders.getByPaymentIntent.${paymentIntentId}`, () =>
      apiClient.get(`/orders/payment-intent/${paymentIntentId}`)
    );
    return response.data;
  },
};

// ============================================================================
// Payment API
// ============================================================================

export const paymentAPI = {
  /**
   * Create Stripe payment intent
   */
  createPaymentIntent: (amount: number, guestInfo?: any) =>
    apiCall<{ clientSecret: string; paymentIntentId: string }>('payment.createIntent', () =>
      apiClient.post('/payments/intent', { amount, guestInfo })
    ),

  /**
   * Confirm payment completion
   */
  confirmPayment: (paymentIntentId: string) =>
    apiCall<{ success: boolean; orderId: string }>('payment.confirm', () =>
      apiClient.post('/payments/confirm', { paymentIntentId })
    ),
};

// ============================================================================
// Costume Inspiration API
// ============================================================================

export interface CostumeInspiration {
  id: string;
  name: string;
  description: string;
  image_url: string;
  products: Product[];
  created_at: string;
}

export const inspirationAPI = {
  /**
   * Get all costume inspirations
   */
  getInspirations: async () => {
    const response = await apiCall<{ success: boolean; data: CostumeInspiration[] }>('inspirations.getAll', () =>
      apiClient.get('/inspirations')
    );
    return response.data;
  },

  /**
   * Get single inspiration by ID
   */
  getInspirationById: async (id: string) => {
    const response = await apiCall<{ success: boolean; data: CostumeInspiration }>(`inspirations.getById.${id}`, () =>
      apiClient.get(`/inspirations/${id}`)
    );
    return response.data;
  },

  /**
   * Get all products for a specific inspiration
   */
  getInspirationProducts: async (id: string) => {
    const response = await apiCall<{ success: boolean; data: Product[] }>(`inspirations.getProducts.${id}`, () =>
      apiClient.get(`/inspirations/${id}/products`)
    );
    return response.data;
  },
};

// ============================================================================
// Combined API Service Export
// ============================================================================

export const api = {
  auth: authAPI,
  products: productAPI,
  cart: cartAPI,
  orders: orderAPI,
  payments: paymentAPI,
  inspirations: inspirationAPI,
};

export default api;
