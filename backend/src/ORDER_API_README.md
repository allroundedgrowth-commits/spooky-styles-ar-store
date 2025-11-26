# Order Management System API

This document describes the Order Management System implementation for Spooky Styles, including order creation, order history, status updates, inventory validation, and low stock alerts.

## Overview

The Order Management System handles the complete order lifecycle from cart conversion to delivery tracking. It includes:

- **Order Creation**: Converts shopping cart to order after successful payment
- **Order History**: Retrieves user's past orders in reverse chronological order
- **Order Details**: Fetches complete order information including items
- **Status Management**: Admin-only order status updates
- **Inventory Validation**: Prevents overselling by validating stock at order creation
- **Low Stock Alerts**: Configurable threshold-based alerts for inventory management

## Features

### 1. Order Creation from Cart

Orders are automatically created after successful Stripe payment via webhook. The system:
- Validates cart is not empty
- Checks product availability and stock levels
- Prevents orders when stock = 0
- Decrements inventory atomically within 5 seconds
- Uses database transactions to ensure data consistency
- Stores customizations (color, accessories) with order items

### 2. Order History

Users can view their complete order history:
- Orders sorted in reverse chronological order (newest first)
- Includes order status, total, and creation date
- Filtered by authenticated user

### 3. Order Details

Retrieve complete order information:
- Order metadata (ID, total, status, dates)
- All order items with product details
- Customizations applied to each item
- Users can only view their own orders

### 4. Order Status Management (Admin Only)

Administrators can update order status through the lifecycle:
- `pending` - Order created, awaiting processing
- `processing` - Order being prepared
- `shipped` - Order dispatched to customer
- `delivered` - Order received by customer
- `cancelled` - Order cancelled

### 5. Inventory Validation

Robust stock validation prevents overselling:
- Validates product exists before order creation
- Rejects orders when `stock_quantity = 0`
- Checks sufficient stock for requested quantity
- Returns clear error messages for stock issues
- Atomic inventory decrement in transaction

### 6. Low Stock Alert System

Configurable alerts for inventory management:
- **Low Stock Alerts**: Products with stock ≤ threshold (default: 10)
- **Out of Stock Alerts**: Products with stock = 0
- Admin-only endpoints for monitoring
- Sorted by stock quantity (lowest first)

## API Endpoints

### Get Order History

```http
GET /api/orders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "total": 59.98,
      "status": "shipped",
      "stripe_payment_intent_id": "pi_xxx",
      "created_at": "2025-11-14T10:30:00Z",
      "updated_at": "2025-11-14T11:00:00Z"
    }
  ],
  "count": 1
}
```

### Get Order Details

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "total": 59.98,
    "status": "shipped",
    "stripe_payment_intent_id": "pi_xxx",
    "created_at": "2025-11-14T10:30:00Z",
    "updated_at": "2025-11-14T11:00:00Z",
    "items": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "product_id": "uuid",
        "quantity": 2,
        "price": 29.99,
        "customizations": {
          "color": "purple",
          "accessories": ["witch-hat"]
        },
        "created_at": "2025-11-14T10:30:00Z"
      }
    ]
  }
}
```

### Update Order Status (Admin Only)

```http
PUT /api/orders/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "total": 59.98,
    "status": "shipped",
    "stripe_payment_intent_id": "pi_xxx",
    "created_at": "2025-11-14T10:30:00Z",
    "updated_at": "2025-11-14T11:00:00Z"
  },
  "message": "Order status updated to shipped"
}
```

**Valid Status Values:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### Get Low Stock Products (Admin Only)

```http
GET /api/products/alerts/low-stock?threshold=10
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `threshold` (optional): Stock level threshold (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Witch Wig Purple",
      "stock_quantity": 5,
      "price": 29.99,
      "category": "wigs",
      "theme": "witch",
      "colors": [...]
    }
  ],
  "count": 1,
  "threshold": 10,
  "message": "Found 1 product(s) with stock at or below 10"
}
```

### Get Out of Stock Products (Admin Only)

```http
GET /api/products/alerts/out-of-stock
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Zombie Wig Green",
      "stock_quantity": 0,
      "price": 34.99,
      "category": "wigs",
      "theme": "zombie",
      "colors": [...]
    }
  ],
  "count": 1,
  "message": "Found 1 out of stock product(s)"
}
```

## Error Handling

### Inventory Validation Errors

**Out of Stock:**
```json
{
  "success": false,
  "error": {
    "message": "Product Witch Wig Purple is out of stock",
    "statusCode": 400
  }
}
```

**Insufficient Stock:**
```json
{
  "success": false,
  "error": {
    "message": "Insufficient stock for product Witch Wig Purple. Only 3 items available.",
    "statusCode": 400
  }
}
```

**Product Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "statusCode": 404
  }
}
```

### Order Errors

**Order Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Order not found",
    "statusCode": 404
  }
}
```

**Invalid Status:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled",
    "statusCode": 400
  }
}
```

**Empty Cart:**
```json
{
  "success": false,
  "error": {
    "message": "Cannot create order from empty cart",
    "statusCode": 400
  }
}
```

## Implementation Details

### Order Service

The `OrderService` class provides the following methods:

```typescript
class OrderService {
  // Create order from cart after payment
  async createOrder(
    userId: string,
    stripePaymentIntentId: string,
    cart: Cart
  ): Promise<OrderWithItems>

  // Get order by ID (optionally filtered by user)
  async getOrderById(
    orderId: string,
    userId?: string
  ): Promise<OrderWithItems | null>

  // Get all orders for a user (reverse chronological)
  async getOrdersByUserId(userId: string): Promise<Order[]>

  // Update order status (admin only)
  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<Order>

  // Get order by Stripe payment intent ID
  async getOrderByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Order | null>
}
```

### Product Service (Inventory Management)

The `ProductService` class provides inventory management methods:

```typescript
class ProductService {
  // Get products with low stock
  async getLowStockProducts(threshold: number = 10): Promise<Product[]>

  // Get products that are out of stock
  async getOutOfStockProducts(): Promise<Product[]>
}
```

### Database Schema

**Orders Table:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Order Items Table:**
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  customizations JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

## Testing

Run the order management tests:

```bash
cd backend
npm run test:order
```

The test suite covers:
- Order creation from cart
- Order history retrieval (reverse chronological)
- Order details with items
- Order status updates (admin)
- Inventory validation (stock = 0 rejection)
- Low stock alerts with configurable threshold
- Out of stock alerts

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 4.5**: Order creation with inventory decrement within 5 seconds
- **Requirement 5.3**: Order history in User Account
- **Requirement 5.4**: Order history displayed in reverse chronological order
- **Requirement 7.3**: Low stock alert system with configurable threshold
- **Requirement 7.4**: Inventory validation to prevent overselling (reject when stock = 0)

## Security Considerations

- All order endpoints require authentication
- Users can only view their own orders
- Order status updates restricted to admin users
- Low stock alerts restricted to admin users
- Database transactions ensure inventory consistency
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

## Performance Optimizations

- Database indexes on frequently queried columns
- Efficient JOIN queries for order items
- Transaction-based inventory updates
- Reverse chronological sorting at database level
- Minimal data transfer for list endpoints