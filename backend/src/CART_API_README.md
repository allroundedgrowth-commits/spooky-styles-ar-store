# Shopping Cart API

This document describes the shopping cart API endpoints for the Spooky Styles e-commerce platform.

## Overview

The shopping cart system uses Redis for storage with a 7-day TTL. All cart operations require authentication via JWT token.

## Authentication

All cart endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Get Cart

Retrieve the current user's shopping cart.

**Endpoint:** `GET /api/cart`

**Response:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "customizations": {
        "color": "red",
        "accessories": ["hat", "earrings"]
      },
      "price": 29.99
    }
  ],
  "updatedAt": "2024-11-14T10:30:00.000Z"
}
```

### Add Item to Cart

Add a product to the cart or update quantity if it already exists with the same customizations.

**Endpoint:** `POST /api/cart/items`

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 2,
  "customizations": {
    "color": "red",
    "accessories": ["hat"]
  }
}
```

**Response:** Returns the updated cart (same format as GET /api/cart)

**Validation:**
- Product must exist
- Quantity must be greater than 0
- Stock must be sufficient for the requested quantity
- If item with same customizations exists, quantities are added together

### Update Item Quantity

Update the quantity of an existing cart item.

**Endpoint:** `PUT /api/cart/items/:productId`

**Request Body:**
```json
{
  "quantity": 3,
  "customizations": {
    "color": "red",
    "accessories": ["hat"]
  }
}
```

**Response:** Returns the updated cart

**Notes:**
- Setting quantity to 0 removes the item from cart
- Customizations are used to identify the specific cart item
- Stock validation is performed

### Remove Item from Cart

Remove a specific item from the cart.

**Endpoint:** `DELETE /api/cart/items/:productId`

**Request Body:**
```json
{
  "customizations": {
    "color": "red",
    "accessories": ["hat"]
  }
}
```

**Response:** Returns the updated cart

### Clear Cart

Remove all items from the cart.

**Endpoint:** `DELETE /api/cart`

**Response:** 204 No Content

### Get Cart Total

Calculate the total price of all items in the cart.

**Endpoint:** `GET /api/cart/total`

**Response:**
```json
{
  "total": 89.97
}
```

## Data Models

### CartItem

```typescript
interface CartItem {
  productId: string;
  quantity: number;
  customizations: CartItemCustomization;
  price: number;
}
```

### CartItemCustomization

```typescript
interface CartItemCustomization {
  color?: string;
  accessories?: string[];
}
```

### Cart

```typescript
interface Cart {
  items: CartItem[];
  updatedAt: string;
}
```

## Error Responses

### 400 Bad Request
- Invalid quantity (must be > 0)
- Insufficient stock

```json
{
  "error": {
    "message": "Insufficient stock. Only 5 items available.",
    "statusCode": 400,
    "timestamp": "2024-11-14T10:30:00.000Z"
  }
}
```

### 401 Unauthorized
- Missing or invalid JWT token

```json
{
  "error": {
    "message": "No token provided",
    "statusCode": 401,
    "timestamp": "2024-11-14T10:30:00.000Z"
  }
}
```

### 404 Not Found
- Product not found
- Cart item not found

```json
{
  "error": {
    "message": "Product not found",
    "statusCode": 404,
    "timestamp": "2024-11-14T10:30:00.000Z"
  }
}
```

## Storage Details

- **Storage:** Redis
- **Key Format:** `cart:{userId}`
- **TTL:** 7 days (604,800 seconds)
- **Data Format:** JSON string

## Features

### Stock Validation

Every cart operation validates that:
1. The product exists in the database
2. Sufficient stock is available
3. Stock quantity is checked in real-time

### Customization Support

Cart items can include customizations:
- **Color:** Selected wig color
- **Accessories:** Array of accessory product IDs

Items with different customizations are treated as separate cart items.

### Price Calculation

- Prices are stored with each cart item
- Promotional prices are used if available
- Total is calculated by summing (price × quantity) for all items
- Total is rounded to 2 decimal places

## Testing

Run the cart service test:

```bash
npm run test:cart
```

Or manually:

```bash
tsx src/test-cart.ts
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **4.1:** Cart persists items with selected customizations (color, accessories)
- **4.2:** Cart displays total price including all items
- **4.3:** Cart allows users to modify quantities or remove items before checkout

## Example Usage Flow

1. **User adds item to cart:**
   ```bash
   POST /api/cart/items
   {
     "productId": "abc-123",
     "quantity": 1,
     "customizations": { "color": "purple" }
   }
   ```

2. **User adds same product with different color:**
   ```bash
   POST /api/cart/items
   {
     "productId": "abc-123",
     "quantity": 1,
     "customizations": { "color": "red" }
   }
   ```
   Result: Two separate items in cart

3. **User updates quantity:**
   ```bash
   PUT /api/cart/items/abc-123
   {
     "quantity": 3,
     "customizations": { "color": "purple" }
   }
   ```

4. **User views cart total:**
   ```bash
   GET /api/cart/total
   ```

5. **User proceeds to checkout:**
   ```bash
   GET /api/cart
   ```
   (Cart data is used for order creation)
