import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../apiService';
import * as apiModule from '../api';

// Mock the api module
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  apiCall: vi.fn((key, fn) => fn()),
  loadingStateManager: {
    setLoading: vi.fn(),
    isLoading: vi.fn(),
    subscribe: vi.fn(),
    getAll: vi.fn(),
  },
  APIError: class APIError extends Error {
    constructor(message: string, public statusCode: number) {
      super(message);
      this.name = 'APIError';
    }
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Product API', () => {
    it('should fetch products with filters', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
      ];

      vi.mocked(apiModule.apiClient.get).mockResolvedValue({ data: mockProducts });

      const products = await api.products.getProducts({ category: 'wigs' });

      expect(products).toEqual(mockProducts);
      expect(apiModule.apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/products')
      );
    });

    it('should search products by keyword', async () => {
      const mockProducts = [{ id: '1', name: 'Witch Wig', price: 100 }];

      vi.mocked(apiModule.apiClient.get).mockResolvedValue({ data: mockProducts });

      const products = await api.products.searchProducts('witch');

      expect(products).toEqual(mockProducts);
      expect(apiModule.apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/products/search')
      );
    });

    it('should get product by ID', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100 };

      vi.mocked(apiModule.apiClient.get).mockResolvedValue({ data: mockProduct });

      const product = await api.products.getProductById('1');

      expect(product).toEqual(mockProduct);
      expect(apiModule.apiClient.get).toHaveBeenCalledWith('/products/1');
    });
  });

  describe('Cart API', () => {
    it('should add item to cart', async () => {
      const mockCart = {
        items: [{ productId: '1', quantity: 1, customizations: {}, price: 100 }],
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(apiModule.apiClient.post).mockResolvedValue({ data: mockCart });

      const cart = await api.cart.addItem({
        productId: '1',
        quantity: 1,
        customizations: {},
      });

      expect(cart).toEqual(mockCart);
      expect(apiModule.apiClient.post).toHaveBeenCalledWith('/cart/items', {
        productId: '1',
        quantity: 1,
        customizations: {},
      });
    });

    it('should remove item from cart', async () => {
      const mockCart = { items: [], updatedAt: new Date().toISOString() };

      vi.mocked(apiModule.apiClient.delete).mockResolvedValue({ data: mockCart });

      const cart = await api.cart.removeItem('1', {});

      expect(cart).toEqual(mockCart);
      expect(apiModule.apiClient.delete).toHaveBeenCalledWith('/cart/items/1', {
        data: { customizations: {} },
      });
    });
  });

  describe('Auth API', () => {
    it('should login user', async () => {
      const mockAuthResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'test-token',
        },
      };

      vi.mocked(apiModule.apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const authData = await api.auth.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(authData).toEqual(mockAuthResponse.data);
      expect(apiModule.apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should register user', async () => {
      const mockAuthResponse = {
        data: {
          user: { id: '1', email: 'new@example.com', name: 'New User' },
          token: 'new-token',
        },
      };

      vi.mocked(apiModule.apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const authData = await api.auth.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(authData).toEqual(mockAuthResponse.data);
      expect(apiModule.apiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });
    });
  });

  describe('Payment API', () => {
    it('should create payment intent', async () => {
      const mockResponse = {
        data: {
          clientSecret: 'secret_123',
          paymentIntentId: 'pi_123',
        },
      };

      vi.mocked(apiModule.apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await api.payments.createPaymentIntent(5000);

      expect(result).toEqual(mockResponse.data);
      expect(apiModule.apiClient.post).toHaveBeenCalledWith('/payments/intent', {
        amount: 5000,
      });
    });

    it('should confirm payment', async () => {
      const mockResponse = {
        data: {
          success: true,
          orderId: 'order_123',
        },
      };

      vi.mocked(apiModule.apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await api.payments.confirmPayment('pi_123');

      expect(result).toEqual(mockResponse.data);
      expect(apiModule.apiClient.post).toHaveBeenCalledWith('/payments/confirm', {
        paymentIntentId: 'pi_123',
      });
    });
  });
});
