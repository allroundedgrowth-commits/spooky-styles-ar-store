# API Integration - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Import the API Service

```typescript
import api from '../services/apiService';
import { useLoadingState } from '../hooks/useLoadingState';
import { APIError } from '../services/api';
```

### 2. Make Your First API Call

```typescript
function ProductList() {
  const [products, setProducts] = useState([]);
  const isLoading = useLoadingState('products.getAll');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.products.getProducts();
      setProducts(data);
    } catch (err) {
      if (err instanceof APIError) {
        console.error(`Error ${err.statusCode}: ${err.message}`);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Render products */}</div>;
}
```

### 3. That's It! 🎉

The API integration handles:
- ✅ JWT token attachment
- ✅ Loading states
- ✅ Error handling
- ✅ Automatic retries
- ✅ Type safety

## Common Use Cases

### Fetch Data with Filters

```typescript
const products = await api.products.getProducts({
  category: 'wigs',
  theme: 'witch',
  search: 'black'
});
```

### Add to Cart

```typescript
const cart = await api.cart.addItem({
  productId: 'product-123',
  quantity: 1,
  customizations: { color: 'black' }
});
```

### Login User

```typescript
const { user, token } = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});
// Token is automatically stored and attached to future requests
```

### Create Order with Payment

```typescript
// Step 1: Create payment intent
const { clientSecret, paymentIntentId } = 
  await api.payments.createPaymentIntent(5000);

// Step 2: Process payment with Stripe
// (Use Stripe Elements here)

// Step 3: Confirm payment
const { orderId } = await api.payments.confirmPayment(paymentIntentId);
```

### Track Multiple Loading States

```typescript
const loadingStates = useLoadingStates([
  'products.getAll',
  'cart.addItem',
  'auth.login'
]);

return (
  <div>
    {loadingStates['products.getAll'] && <Spinner />}
    {loadingStates['cart.addItem'] && <p>Adding to cart...</p>}
  </div>
);
```

### Check if Any API Call is Loading

```typescript
const isAnyLoading = useAnyLoading();

return (
  <div>
    {isAnyLoading && <GlobalSpinner />}
  </div>
);
```

## Error Handling Patterns

### Basic Error Handling

```typescript
try {
  const products = await api.products.getProducts();
} catch (err) {
  if (err instanceof APIError) {
    alert(err.message);
  }
}
```

### Specific Error Handling

```typescript
try {
  await api.auth.login({ email, password });
} catch (err) {
  if (err instanceof APIError) {
    switch (err.statusCode) {
      case 401:
        setError('Invalid credentials');
        break;
      case 429:
        setError('Too many attempts. Try again later.');
        break;
      default:
        setError('Login failed. Please try again.');
    }
  }
}
```

### Silent Error Handling

```typescript
try {
  await api.cart.addItem(item);
} catch (err) {
  // Silently fail - user can try again
  console.error('Failed to add to cart:', err);
}
```

## Available APIs

### Authentication
```typescript
api.auth.register(data)
api.auth.login(data)
api.auth.logout()
api.auth.getCurrentUser()
api.auth.updateProfile(updates)
```

### Products
```typescript
api.products.getProducts(filters?)
api.products.searchProducts(keyword)
api.products.getProductById(id)
api.products.createProduct(product)      // Admin only
api.products.updateProduct(id, updates)  // Admin only
api.products.deleteProduct(id)           // Admin only
```

### Cart
```typescript
api.cart.getCart()
api.cart.addItem(item)
api.cart.updateItem(productId, quantity, customizations)
api.cart.removeItem(productId, customizations)
api.cart.clearCart()
api.cart.getTotal()
```

### Orders
```typescript
api.orders.createOrder(orderData)
api.orders.getOrders()
api.orders.getOrderById(id)
api.orders.updateOrderStatus(id, status)  // Admin only
```

### Payments
```typescript
api.payments.createPaymentIntent(amount)
api.payments.confirmPayment(paymentIntentId)
```

### Inspirations
```typescript
api.inspirations.getInspirations()
api.inspirations.getInspirationById(id)
api.inspirations.getInspirationProducts(id)
```

## Loading State Keys

Each API method has a unique loading key:

- `auth.register`, `auth.login`, `auth.logout`
- `products.getAll`, `products.search`, `products.getById.{id}`
- `cart.get`, `cart.addItem`, `cart.updateItem.{id}`
- `orders.create`, `orders.getAll`, `orders.getById.{id}`
- `payment.createIntent`, `payment.confirm`
- `inspirations.getAll`, `inspirations.getById.{id}`

## Tips & Best Practices

### ✅ DO

- Use the `api` service for all API calls
- Use loading state hooks for UI feedback
- Handle errors with try-catch
- Check for `APIError` type
- Let the interceptor handle authentication
- Trust the automatic retry logic

### ❌ DON'T

- Don't use `apiClient` directly (use `api` service)
- Don't manually manage loading states
- Don't manually add auth tokens
- Don't implement your own retry logic
- Don't ignore errors

## Troubleshooting

### "Token not attached to request"
**Solution**: Ensure token is stored with key `auth_token` in localStorage

### "Loading state not updating"
**Solution**: Verify you're using the correct loading key

### "401 redirect loop"
**Solution**: Ensure `/account` route exists and doesn't make auth requests on mount

### "Request timeout"
**Solution**: Check network connection and backend availability

### "Retry not working"
**Solution**: Verify status code is in retryable list (408, 429, 500, 502, 503, 504)

## Need More Help?

- 📖 Full Documentation: `API_INTEGRATION_README.md`
- 🏗️ Architecture: `API_ARCHITECTURE.md`
- ✅ Checklist: `API_INTEGRATION_CHECKLIST.md`
- 📝 Summary: `API_INTEGRATION_SUMMARY.md`
- 💡 Examples: `examples/APIIntegrationExample.tsx`

## Environment Setup

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://api.spookystyles.com/api
```

## Next Steps

1. ✅ Import `api` service in your component
2. ✅ Use `useLoadingState` for loading indicators
3. ✅ Handle errors with try-catch
4. ✅ Test your implementation
5. ✅ Deploy with confidence!

Happy coding! 🎃👻
