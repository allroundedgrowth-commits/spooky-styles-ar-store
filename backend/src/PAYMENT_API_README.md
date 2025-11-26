# Payment & Order API Documentation

## Overview

This document describes the Stripe payment integration and order management system for Spooky Styles. The implementation handles payment intent creation, webhook processing, order creation, and inventory management.

## Architecture

### Payment Flow

1. **Client creates payment intent** → `POST /api/payments/intent`
2. **Client collects payment** → Stripe.js handles card collection
3. **Stripe processes payment** → Sends webhook to server
4. **Server creates order** → Webhook handler creates order and decrements inventory
5. **Client confirms payment** → `POST /api/payments/confirm` (optional verification)

### Key Features

- ✅ Secure payment processing with Stripe
- ✅ Webhook signature verification
- ✅ Automatic order creation after successful payment
- ✅ Inventory decrement within 5 seconds of payment success
- ✅ Transaction rollback on failures
- ✅ Payment failure handling
- ✅ Order history and status management

## API Endpoints

### Payment Endpoints

#### Create Payment Intent

Creates a Stripe payment intent for the current user's cart.

**Endpoint:** `POST /api/payments/intent`

**Authentication:** Required (Bearer token)

**Request Body:** None (uses cart from authenticated user)

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/payments/intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Errors:**
- `400` - Cart is empty or total is less than $0.50
- `401` - Unauthorized (missing or invalid token)

---

#### Confirm Payment

Verifies that a payment has been completed successfully.

**Endpoint:** `POST /api/payments/confirm`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "status": "succeeded",
  "paymentIntentId": "pi_xxx"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId": "pi_xxx"}'
```

**Errors:**
- `400` - Payment intent ID missing or payment not completed
- `401` - Unauthorized

---

#### Stripe Webhook

Receives and processes Stripe webhook events.

**Endpoint:** `POST /api/payments/webhook`

**Authentication:** None (verified by Stripe signature)

**Headers Required:**
- `stripe-signature` - Stripe webhook signature

**Request Body:** Raw Stripe event payload

**Response:**
```json
{
  "received": true
}
```

**Handled Events:**
- `payment_intent.succeeded` - Creates order and decrements inventory
- `payment_intent.payment_failed` - Cancels order if exists
- `payment_intent.canceled` - Cancels order if exists

**Setup Instructions:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
4. Copy webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

---

### Order Endpoints

#### Get Order History

Retrieves all orders for the authenticated user in reverse chronological order.

**Endpoint:** `GET /api/orders`

**Authentication:** Required (Bearer token)

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "total": 99.99,
    "status": "processing",
    "stripe_payment_intent_id": "pi_xxx",
    "created_at": "2024-11-14T10:00:00Z",
    "updated_at": "2024-11-14T10:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### Get Order Details

Retrieves detailed information about a specific order including items.

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "total": 99.99,
  "status": "processing",
  "stripe_payment_intent_id": "pi_xxx",
  "created_at": "2024-11-14T10:00:00Z",
  "updated_at": "2024-11-14T10:00:00Z",
  "items": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "price": 49.99,
      "customizations": {
        "color": "Black",
        "accessories": ["hat-001"]
      },
      "created_at": "2024-11-14T10:00:00Z"
    }
  ]
}
```

**Example:**
```bash
curl -X GET http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Errors:**
- `404` - Order not found or doesn't belong to user

---

#### Update Order Status (Admin Only)

Updates the status of an order.

**Endpoint:** `PUT /api/orders/:id/status`

**Authentication:** Required (Bearer token + Admin role)

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid Statuses:**
- `pending` - Order created, awaiting processing
- `processing` - Payment confirmed, preparing order
- `shipped` - Order shipped to customer
- `delivered` - Order delivered
- `cancelled` - Order cancelled

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "total": 99.99,
  "status": "shipped",
  "stripe_payment_intent_id": "pi_xxx",
  "created_at": "2024-11-14T10:00:00Z",
  "updated_at": "2024-11-14T10:05:00Z"
}
```

**Example:**
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

**Errors:**
- `400` - Invalid status
- `403` - Forbidden (not admin)
- `404` - Order not found

---

## Data Models

### Order

```typescript
interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripe_payment_intent_id: string | null;
  created_at: Date;
  updated_at: Date;
}
```

### Order Item

```typescript
interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  customizations: {
    color?: string;
    accessories?: string[];
  };
  created_at: Date;
}
```

## Payment Flow Details

### 1. Create Payment Intent

When a user initiates checkout:

1. Frontend calls `POST /api/payments/intent`
2. Backend retrieves user's cart from Redis
3. Backend calculates total amount
4. Backend creates Stripe payment intent
5. Backend returns `clientSecret` to frontend
6. Frontend uses Stripe.js to collect payment

### 2. Process Payment

1. User enters payment details in Stripe Elements
2. Stripe processes payment
3. Stripe sends webhook to `POST /api/payments/webhook`
4. Backend verifies webhook signature
5. Backend processes `payment_intent.succeeded` event

### 3. Create Order

When payment succeeds (webhook handler):

1. Retrieve user's cart from Redis
2. Begin database transaction
3. Create order record with payment intent ID
4. Create order items from cart items
5. Validate inventory for each product
6. Decrement inventory for each product
7. Commit transaction
8. Update order status to "processing"
9. Clear user's cart from Redis

**Timing:** Order creation and inventory decrement complete within 5 seconds of payment success.

### 4. Handle Failures

If payment fails or is cancelled:

1. Webhook handler receives event
2. Check if order was created
3. Update order status to "cancelled"
4. No inventory rollback needed (inventory only decremented after successful payment)

## Error Handling

### Payment Errors

- **Empty Cart:** Returns 400 error when trying to create payment intent with empty cart
- **Insufficient Stock:** Validates inventory before creating order, returns 400 if stock insufficient
- **Payment Not Completed:** Returns 400 when confirming payment that hasn't succeeded
- **Webhook Signature Invalid:** Returns 400 when webhook signature verification fails

### Order Creation Errors

All order creation happens in a database transaction:

- If any step fails, entire transaction is rolled back
- Inventory changes are atomic
- No partial orders are created

### Rollback Logic

```typescript
// Transaction ensures atomicity
BEGIN TRANSACTION
  - Create order
  - Create order items
  - Decrement inventory
  IF any step fails:
    ROLLBACK
  ELSE:
    COMMIT
END TRANSACTION
```

## Testing

### Run Payment Tests

```bash
# Make sure backend server is running
npm run dev

# In another terminal, run payment tests
npm run test:payment
```

### Test with Stripe Test Cards

Use these test cards in development:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Insufficient Funds:** `4000 0000 0000 9995`

Any future expiry date and any 3-digit CVC will work.

### Test Webhook Locally

Use Stripe CLI to forward webhooks to local server:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/payments/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Security Considerations

### Payment Security

- ✅ Never store credit card details on server
- ✅ Use Stripe.js for PCI-compliant card collection
- ✅ Verify webhook signatures to prevent spoofing
- ✅ Use HTTPS in production
- ✅ Validate all payment amounts server-side

### Order Security

- ✅ Authenticate all order endpoints
- ✅ Users can only view their own orders
- ✅ Admin role required for status updates
- ✅ Validate inventory before order creation
- ✅ Use database transactions for atomicity

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 4.4:** Payment Gateway processes transactions securely using encryption (Stripe handles encryption)
- **Requirement 4.5:** 
  - Inventory System decrements stock levels within 5 seconds of successful payment ✅
  - Transaction succeeds → Order created and inventory decremented ✅
  - Prevents overselling by validating stock before order creation ✅

## Next Steps

1. **Frontend Integration:**
   - Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
   - Create checkout page with Stripe Elements
   - Handle payment confirmation and redirect to order confirmation

2. **Production Setup:**
   - Replace test API keys with live keys
   - Configure production webhook endpoint
   - Set up monitoring for payment failures
   - Implement email notifications for order confirmations

3. **Additional Features:**
   - Add refund functionality
   - Implement order cancellation by users
   - Add shipping address collection
   - Implement order tracking
