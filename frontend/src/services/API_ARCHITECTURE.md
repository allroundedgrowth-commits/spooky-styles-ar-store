# API Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Components                          │
│  (Products, Cart, Checkout, Auth, AR Try-On, etc.)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Uses hooks & services
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Loading State Hooks                           │
│  • useLoadingState(key)                                          │
│  • useLoadingStates(keys)                                        │
│  • useAnyLoading()                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Subscribes to
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Service Layer (Facade)                          │
│  • auth.service.ts                                               │
│  • product.service.ts                                            │
│  • cart.service.ts                                               │
│  • order.service.ts                                              │
│  • payment.service.ts                                            │
│  • inspiration.service.ts                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Calls
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Service (apiService.ts)                   │
│  Typed methods for all endpoints:                                │
│  • api.auth.*                                                    │
│  • api.products.*                                                │
│  • api.cart.*                                                    │
│  • api.orders.*                                                  │
│  • api.payments.*                                                │
│  • api.inspirations.*                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    apiCall() Wrapper                             │
│  • Tracks loading states                                         │
│  • Wraps axios calls                                             │
│  • Returns typed data                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Executes
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Axios Client (apiClient)                        │
│  Configuration:                                                  │
│  • Base URL: VITE_API_URL                                        │
│  • Timeout: 30 seconds                                           │
│  • Headers: Content-Type, Authorization                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Interceptors
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Request Interceptor                             │
│  • Attach JWT token from localStorage                            │
│  • Add retry count header                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Request
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API                                 │
│  Express.js REST API on port 5000                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Response
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Response Interceptor                            │
│  • Handle errors (401, 403, 404, 429, 500)                      │
│  • Retry failed requests (exponential backoff)                   │
│  • Throw APIError with status codes                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Returns data or throws error
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Loading State Manager                           │
│  • Tracks loading states by key                                  │
│  • Notifies subscribers on changes                               │
│  • Provides getAll() for global state                            │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Successful Request

```
Component
  │
  ├─> useLoadingState('products.getAll')  [Loading: false]
  │
  └─> api.products.getProducts()
        │
        ├─> apiCall('products.getAll', ...)
        │     │
        │     ├─> loadingStateManager.setLoading('products.getAll', true)
        │     │   └─> Notify subscribers  [Loading: true]
        │     │
        │     └─> apiClient.get('/products')
        │           │
        │           ├─> Request Interceptor
        │           │   └─> Add Authorization: Bearer <token>
        │           │
        │           ├─> HTTP GET /api/products
        │           │
        │           ├─> Backend processes request
        │           │
        │           ├─> HTTP 200 OK with products data
        │           │
        │           └─> Response Interceptor
        │               └─> Pass through (no error)
        │
        └─> loadingStateManager.setLoading('products.getAll', false)
            └─> Notify subscribers  [Loading: false]
```

### Failed Request with Retry

```
Component
  │
  └─> api.products.getProducts()
        │
        └─> apiCall('products.getAll', ...)
              │
              ├─> loadingStateManager.setLoading('products.getAll', true)
              │
              └─> apiClient.get('/products')
                    │
                    ├─> HTTP GET /api/products
                    │
                    ├─> HTTP 500 Server Error
                    │
                    └─> Response Interceptor
                          │
                          ├─> Detect retryable error (500)
                          │
                          ├─> Retry count: 0 < 3
                          │
                          ├─> Wait 1 second (exponential backoff)
                          │
                          ├─> Retry HTTP GET /api/products
                          │
                          ├─> HTTP 200 OK
                          │
                          └─> Return data
```

### Authentication Error

```
Component
  │
  └─> api.products.getProducts()
        │
        └─> apiClient.get('/products')
              │
              ├─> HTTP GET /api/products
              │
              ├─> HTTP 401 Unauthorized
              │
              └─> Response Interceptor
                    │
                    ├─> Detect 401 error
                    │
                    ├─> localStorage.removeItem('auth_token')
                    │
                    ├─> window.location.href = '/account'
                    │
                    └─> Throw APIError('Unauthorized', 401)
```

## Loading State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Component calls api.products.getProducts()                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  apiCall() sets loading state to TRUE                            │
│  Key: 'products.getAll'                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  LoadingStateManager notifies all subscribers                    │
│  { 'products.getAll': true }                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  useLoadingState hook receives update                            │
│  Component re-renders with isLoading = true                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  API request completes (success or error)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  apiCall() sets loading state to FALSE                           │
│  Key: 'products.getAll'                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  LoadingStateManager notifies all subscribers                    │
│  { 'products.getAll': false }                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  useLoadingState hook receives update                            │
│  Component re-renders with isLoading = false                     │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
HTTP Error
  │
  ├─> 401 Unauthorized
  │     ├─> Clear auth token
  │     ├─> Redirect to /account
  │     └─> Throw APIError(401)
  │
  ├─> 403 Forbidden
  │     └─> Throw APIError(403, 'Access denied')
  │
  ├─> 404 Not Found
  │     └─> Throw APIError(404, 'Resource not found')
  │
  ├─> 429 Too Many Requests
  │     ├─> Retry if count < 3
  │     └─> Throw APIError(429, 'Rate limit')
  │
  ├─> 500 Server Error
  │     ├─> Retry if count < 3
  │     └─> Throw APIError(500, 'Server error')
  │
  └─> Network Error
        └─> Throw APIError(0, 'Network error')
```

## Key Components

### 1. apiClient (Axios Instance)
- Base configuration
- Request/response interceptors
- Timeout handling

### 2. apiCall() Wrapper
- Loading state management
- Wraps axios calls
- Returns typed data

### 3. API Service (apiService.ts)
- Typed methods for all endpoints
- Consistent interface
- Automatic loading states

### 4. LoadingStateManager
- Tracks loading states
- Subscription system
- Real-time updates

### 5. React Hooks
- useLoadingState(key)
- useLoadingStates(keys)
- useAnyLoading()

### 6. Service Layer
- Facade pattern
- Business logic
- Backward compatibility

## Benefits

1. **Type Safety**: Full TypeScript support
2. **Automatic Loading States**: No manual state management
3. **Error Handling**: Consistent error handling across all APIs
4. **Retry Logic**: Automatic retry for transient failures
5. **Authentication**: Automatic token attachment
6. **Centralized Configuration**: Single source of truth
7. **Easy Testing**: Mockable services
8. **Developer Experience**: IntelliSense and autocomplete
