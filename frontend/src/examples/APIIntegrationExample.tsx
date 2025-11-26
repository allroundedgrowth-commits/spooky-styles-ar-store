import React, { useEffect, useState } from 'react';
import api from '../services/apiService';
import { useLoadingState, useLoadingStates, useAnyLoading } from '../hooks/useLoadingState';
import { Product } from '../types/product';
import { APIError } from '../services/api';

/**
 * Example component demonstrating the API integration layer usage
 * 
 * Features demonstrated:
 * - Typed API calls with automatic loading state management
 * - Error handling with APIError
 * - Retry logic for failed requests
 * - Authentication interceptor
 * - Multiple loading state tracking
 */

export const APIIntegrationExample: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Track loading state for specific API call
  const isLoadingProducts = useLoadingState('products.getAll');
  
  // Track multiple loading states
  const loadingStates = useLoadingStates([
    'products.getAll',
    'cart.addItem',
    'auth.login'
  ]);
  
  // Check if any API call is loading
  const isAnyLoading = useAnyLoading();

  // Example 1: Fetch products with automatic loading state
  const fetchProducts = async () => {
    try {
      setError(null);
      const data = await api.products.getProducts({ category: 'wigs' });
      setProducts(data);
    } catch (err) {
      if (err instanceof APIError) {
        setError(`Error ${err.statusCode}: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Example 2: Add item to cart with loading state
  const addToCart = async (productId: string) => {
    try {
      await api.cart.addItem({
        productId,
        quantity: 1,
        customizations: { color: 'black' }
      });
      alert('Added to cart!');
    } catch (err) {
      if (err instanceof APIError) {
        alert(`Failed to add to cart: ${err.message}`);
      }
    }
  };

  // Example 3: Login with error handling
  const handleLogin = async (email: string, password: string) => {
    try {
      const authData = await api.auth.login({ email, password });
      console.log('Logged in:', authData.user);
      // Token is automatically stored and attached to future requests
    } catch (err) {
      if (err instanceof APIError) {
        if (err.statusCode === 401) {
          alert('Invalid credentials');
        } else if (err.statusCode === 429) {
          alert('Too many login attempts. Please try again later.');
        } else {
          alert(`Login failed: ${err.message}`);
        }
      }
    }
  };

  // Example 4: Create order with payment
  const createOrder = async () => {
    try {
      // Step 1: Create payment intent
      const { paymentIntentId } = await api.payments.createPaymentIntent(5000);
      
      // Step 2: Process payment with Stripe (simplified)
      // In real implementation, use Stripe Elements
      
      // Step 3: Confirm payment
      const { orderId } = await api.payments.confirmPayment(paymentIntentId);
      
      console.log('Order created:', orderId);
    } catch (err) {
      if (err instanceof APIError) {
        alert(`Order failed: ${err.message}`);
      }
    }
  };

  // Example 5: Search products with debouncing
  // @ts-ignore - Example function for documentation
  const handleSearch = async (keyword: string) => {
    try {
      const results = await api.products.searchProducts(keyword);
      setProducts(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">API Integration Example</h1>

      {/* Loading States Display */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Loading States</h2>
        <div className="space-y-1">
          <p>Products Loading: {isLoadingProducts ? '✓' : '✗'}</p>
          <p>Cart Loading: {loadingStates['cart.addItem'] ? '✓' : '✗'}</p>
          <p>Auth Loading: {loadingStates['auth.login'] ? '✓' : '✗'}</p>
          <p>Any Loading: {isAnyLoading ? '✓' : '✗'}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Products Display */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        {isLoadingProducts ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border p-4 rounded">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={loadingStates['cart.addItem']}
                  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
                >
                  {loadingStates['cart.addItem'] ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-x-4">
        <button
          onClick={fetchProducts}
          disabled={isLoadingProducts}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          Refresh Products
        </button>
        
        <button
          onClick={() => handleLogin('test@example.com', 'password')}
          disabled={loadingStates['auth.login']}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Test Login
        </button>
        
        <button
          onClick={createOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Order
        </button>
      </div>

      {/* API Features Documentation */}
      <div className="mt-8 p-6 bg-gray-50 rounded">
        <h2 className="text-xl font-semibold mb-4">API Integration Features</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li><strong>Automatic JWT Token Attachment:</strong> Auth token is automatically added to all requests</li>
          <li><strong>Retry Logic:</strong> Failed requests (408, 429, 500, 502, 503, 504) are retried up to 3 times with exponential backoff</li>
          <li><strong>Error Handling:</strong> Comprehensive error handling for 401, 403, 404, 429, and 500 responses</li>
          <li><strong>Loading States:</strong> Automatic loading state management for all API calls</li>
          <li><strong>Type Safety:</strong> Fully typed API methods with TypeScript</li>
          <li><strong>Timeout Handling:</strong> 30-second timeout for all requests</li>
          <li><strong>Network Error Detection:</strong> Handles network errors and connection issues</li>
        </ul>
      </div>
    </div>
  );
};

export default APIIntegrationExample;
