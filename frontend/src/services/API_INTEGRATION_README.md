# API Integration Layer

Comprehensive API integration layer with automatic loading state management, error handling, retry logic, and type safety.

## Features

### ✅ Authentication Interceptor
- Automatically attaches JWT token to all requests
- Stores token in localStorage
- Redirects to login on 401 responses

### ✅ Error Handling
- Comprehensive error handling for all HTTP status codes
- Custom `APIError` class with status codes
- User-friendly error messages
- Automatic handling of:
  - **401 Unauthorized**: Clears token and redirects to login
  - **403 Forbidden**: Access denied message
  - **404 Not Found**: Resource not found
  - **429 Too Many Requests**: Rate limit message
  - **500 Server Error**: Generic server error

### ✅ Retry Logic
- Automatic retry for failed requests
- Retries up to 3 times for status codes: 408, 429, 500, 502, 503, 504
- Exponential backoff (1s, 2s, 4s)
- Prevents infinite retry loops

### ✅ Loading State Management
- Automatic loading state tracking for all API calls
- React hooks for easy integration
- Support for tracking multiple loading states
- Global loading state detection

### ✅ Type Safety
- Fully typed API methods with TypeScript
- Type-safe request and response handling
- IntelliSense support for all endpoints

### ✅ Timeout Handling
- 30-second timeout for all requests
- Network error detection
- Connection issue handling

## Usage

### Basic API Calls

```typescript
import api from '../services/apiService';

// Fetch products
const products = await api.products.getProducts({ category: 'wigs' });

// Add to cart
await api.cart.addItem({
  productId: 'product-123',
  quantity: 1,
  customizations: { color: 'black' }
});

// Login
const authData = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Loading States

```typescript
import { useLoadingState, useLoadingStates, useAnyLoading } from '../hooks/useLoadingState';

function MyComponent() {
  // Track single loading state
  const isLoading = useLoadingState('products.getAll');
  
  // Track multiple loading states
  const loadingStates = useLoadingStates([
    'products.getAll',
    'cart.addItem'
  ]);
  
  // Check if any API call is loading
  const isAnyLoading = useAnyLoading();
  
  return (
    <div>
      {isLoading && <p>Loading products...</p>}
      {loadingStates['cart.addItem'] && <p>Adding to cart...</p>}
      {isAnyLoading && <div className="global-spinner" />}
    </div>
  );
}
```

### Error Handling

```typescript
import { APIError } from '../services/api';

try {
  const products = await api.products.getProducts();
} catch (err) {
  if (err instanceof APIError) {
    console.error(`Error ${err.statusCode}: ${err.message}`);
    
    // Handle specific errors
    if (err.statusCode === 404) {
      // Handle not found
    } else if (err.statusCode === 429) {
      // Handle rate limit
    }
  }
}
```

## API Methods

### Authentication API

```typescript
api.auth.register(data: RegisterRequest): Promise<AuthResponse>
api.auth.login(data: LoginRequest): Promise<AuthResponse>
api.auth.logout(): Promise<void>
api.auth.getCurrentUser(): Promise<User>
api.auth.updateProfile(updates: Partial<User>): Promise<User>
```

### Product API

```typescript
api.products.getProducts(filters?: ProductFilters): Promise<Product[]>
api.products.searchProducts(keyword: string): Promise<Product[]>
api.products.getProductById(id: string): Promise<Product>
api.products.createProduct(product: Omit<Product, 'id'>): Promise<Product>
api.products.updateProduct(id: string, updates: Partial<Product>): Promise<Product>
api.products.deleteProduct(id: string): Promise<void>
```

### Cart API

```typescript
api.cart.getCart(): Promise<Cart>
api.cart.addItem(item: Omit<CartItem, 'price'>): Promise<Cart>
api.cart.updateItem(productId: string, quantity: number, customizations: CartItemCustomization): Promise<Cart>
api.cart.removeItem(productId: string, customizations: CartItemCustomization): Promise<Cart>
api.cart.clearCart(): Promise<void>
api.cart.getTotal(): Promise<{ total: number }>
```

### Order API

```typescript
api.orders.createOrder(orderData: OrderCreateRequest): Promise<Order>
api.orders.getOrders(): Promise<Order[]>
api.orders.getOrderById(id: string): Promise<Order>
api.orders.updateOrderStatus(id: string, status: OrderStatus): Promise<Order>
```

### Payment API

```typescript
api.payments.createPaymentIntent(amount: number): Promise<{ clientSecret: string; paymentIntentId: string }>
api.payments.confirmPayment(paymentIntentId: string): Promise<{ success: boolean; orderId: string }>
```

### Inspiration API

```typescript
api.inspirations.getInspirations(): Promise<CostumeInspiration[]>
api.inspirations.getInspirationById(id: string): Promise<CostumeInspiration>
api.inspirations.getInspirationProducts(id: string): Promise<Product[]>
```

## Loading State Keys

Each API method has a unique loading state key:

- `auth.register`
- `auth.login`
- `auth.logout`
- `auth.getCurrentUser`
- `auth.updateProfile`
- `products.getAll`
- `products.search`
- `products.getById.{id}`
- `products.create`
- `products.update.{id}`
- `products.delete.{id}`
- `cart.get`
- `cart.addItem`
- `cart.updateItem.{productId}`
- `cart.removeItem.{productId}`
- `cart.clear`
- `cart.getTotal`
- `orders.create`
- `orders.getAll`
- `orders.getById.{id}`
- `orders.updateStatus.{id}`
- `payment.createIntent`
- `payment.confirm`
- `inspirations.getAll`
- `inspirations.getById.{id}`
- `inspirations.getProducts.{id}`

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

### Retry Configuration

Modify in `frontend/src/services/api.ts`:

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
```

### Timeout Configuration

```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
});
```

## Migration Guide

### Updating Existing Services

Replace direct `apiClient` calls with the new `api` service:

**Before:**
```typescript
const response = await apiClient.get('/products');
const products = response.data;
```

**After:**
```typescript
const products = await api.products.getProducts();
```

### Adding Loading States

**Before:**
```typescript
const [loading, setLoading] = useState(false);

const fetchProducts = async () => {
  setLoading(true);
  try {
    const response = await apiClient.get('/products');
    setProducts(response.data);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const isLoading = useLoadingState('products.getAll');

const fetchProducts = async () => {
  const products = await api.products.getProducts();
  setProducts(products);
};
```

## Testing

### Mocking API Calls

```typescript
import api from '../services/apiService';

jest.mock('../services/apiService', () => ({
  products: {
    getProducts: jest.fn(),
  },
}));

test('fetches products', async () => {
  const mockProducts = [{ id: '1', name: 'Test Product' }];
  (api.products.getProducts as jest.Mock).mockResolvedValue(mockProducts);
  
  const products = await api.products.getProducts();
  expect(products).toEqual(mockProducts);
});
```

## Best Practices

1. **Always use the `api` service** instead of direct `apiClient` calls
2. **Use loading state hooks** for UI feedback
3. **Handle errors with try-catch** and check for `APIError`
4. **Use specific loading keys** for granular loading state control
5. **Let the interceptor handle authentication** - don't manually add tokens
6. **Trust the retry logic** - don't implement your own retry mechanisms

## Troubleshooting

### Token Not Attached
- Ensure token is stored in localStorage with key `auth_token`
- Check that the request interceptor is configured

### Retry Not Working
- Verify the status code is in `RETRYABLE_STATUS_CODES`
- Check that retry count hasn't exceeded `MAX_RETRIES`

### Loading State Not Updating
- Ensure you're using the correct loading state key
- Verify the component is subscribed to loading state changes

### 401 Redirect Loop
- Check that `/account` route exists
- Ensure login page doesn't make authenticated requests on mount
