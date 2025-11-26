# Paystack Integration Guide

Complete guide to integrate Paystack payment gateway into your Spooky Wigs Store.

## 🎯 Overview

Paystack is a payment gateway for African businesses. This guide replaces Stripe with Paystack.

## 📋 Prerequisites

1. Paystack account ([paystack.com](https://paystack.com))
2. Test API keys (for development)
3. Live API keys (for production)

## 🔑 Get Your API Keys

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your keys:
   - **Test Public Key**: `pk_test_xxx`
   - **Test Secret Key**: `sk_test_xxx`
   - **Live Public Key**: `pk_live_xxx` (after verification)
   - **Live Secret Key**: `sk_live_xxx` (after verification)

## 🔧 Backend Integration

### 1. Install Paystack SDK

```bash
cd backend
npm install paystack-api
```

### 2. Update Environment Variables

Add to `.env`:
```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_CALLBACK_URL=https://your-frontend-url.vercel.app/payment/callback
```

### 3. Create Paystack Config

File: `backend/src/config/paystack.ts`

### 4. Create Paystack Service

File: `backend/src/services/paystack.service.ts`

### 5. Update Payment Routes

File: `backend/src/routes/payment.routes.ts`

### 6. Add Webhook Handler

File: `backend/src/routes/webhook.routes.ts`

## 🎨 Frontend Integration

### 1. Install Paystack React

```bash
cd frontend
npm install react-paystack
```

### 2. Update Environment Variables

Add to `frontend/.env`:
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### 3. Create Paystack Hook

File: `frontend/src/hooks/usePaystack.ts`

### 4. Create Payment Component

File: `frontend/src/components/Payment/PaystackButton.tsx`

### 5. Update Checkout Page

File: `frontend/src/pages/Checkout.tsx`

## 🧪 Testing

### Test Cards

Paystack provides test cards for different scenarios:

#### Successful Payment
- **Card**: `4084 0840 8408 4081`
- **CVV**: `408`
- **Expiry**: Any future date
- **PIN**: `0000`
- **OTP**: `123456`

#### Insufficient Funds
- **Card**: `5060 6666 6666 6666 6666`
- **CVV**: `123`
- **Expiry**: Any future date
- **PIN**: `1234`

#### Declined Transaction
- **Card**: `5060 0000 0000 0000 0000`
- **CVV**: `123`
- **Expiry**: Any future date

### Test Flow

1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Click "Pay with Paystack"
5. Use test card details
6. Complete payment
7. Verify order confirmation

## 🔔 Webhook Setup

### 1. Configure Webhook URL

In Paystack Dashboard:
1. Go to **Settings** → **API Keys & Webhooks**
2. Add webhook URL: `https://your-backend.onrender.com/api/webhooks/paystack`
3. Select events to listen for:
   - `charge.success`
   - `charge.failed`
   - `transfer.success`
   - `transfer.failed`

### 2. Verify Webhook Signature

Paystack sends a signature in the `x-paystack-signature` header.

## 💰 Supported Payment Methods

Paystack supports:
- ✅ Card payments (Visa, Mastercard, Verve)
- ✅ Bank transfers
- ✅ USSD
- ✅ Mobile money
- ✅ QR codes
- ✅ Bank accounts

## 🌍 Supported Countries

- 🇳🇬 Nigeria
- 🇬🇭 Ghana
- 🇿🇦 South Africa
- 🇰🇪 Kenya

## 💵 Currency Support

- NGN (Nigerian Naira)
- GHS (Ghanaian Cedi)
- ZAR (South African Rand)
- USD (US Dollar)
- KES (Kenyan Shilling)

## 🔒 Security Best Practices

1. **Never expose secret key** in frontend
2. **Verify webhook signatures** on backend
3. **Use HTTPS** in production
4. **Validate amounts** on backend
5. **Store transaction references** in database
6. **Implement idempotency** for webhooks

## 📊 Transaction Flow

```
1. User clicks "Pay with Paystack"
   ↓
2. Frontend calls backend to initialize transaction
   ↓
3. Backend creates transaction with Paystack API
   ↓
4. Backend returns authorization URL and reference
   ↓
5. Frontend opens Paystack payment modal
   ↓
6. User completes payment
   ↓
7. Paystack sends webhook to backend
   ↓
8. Backend verifies transaction
   ↓
9. Backend updates order status
   ↓
10. Frontend redirects to confirmation page
```

## 🔄 Refund Process

### Initiate Refund

```typescript
// Backend
const refund = await paystackService.refundTransaction(
  transactionReference,
  amount // optional, defaults to full amount
);
```

### Check Refund Status

```typescript
const status = await paystackService.getRefundStatus(refundId);
```

## 📈 Go Live Checklist

Before switching to live mode:

- [ ] Complete Paystack business verification
- [ ] Update environment variables with live keys
- [ ] Test all payment flows
- [ ] Set up webhook URL for production
- [ ] Configure proper error handling
- [ ] Set up transaction monitoring
- [ ] Test refund process
- [ ] Update terms and conditions
- [ ] Add privacy policy
- [ ] Configure email notifications

## 🆘 Common Issues

### Payment Modal Not Opening
- Check if public key is correct
- Verify frontend environment variable
- Check browser console for errors

### Webhook Not Receiving Events
- Verify webhook URL is accessible
- Check Paystack dashboard for failed deliveries
- Ensure HTTPS is enabled
- Verify signature validation

### Transaction Verification Fails
- Check secret key is correct
- Verify transaction reference format
- Check network connectivity
- Review Paystack API logs

## 📚 Resources

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api)
- [React Paystack](https://github.com/iamraphson/react-paystack)
- [Paystack Node SDK](https://github.com/PaystackHQ/paystack-node)

## 💡 Tips

1. **Test thoroughly** with test cards before going live
2. **Handle all payment states**: success, pending, failed
3. **Implement retry logic** for failed webhooks
4. **Log all transactions** for debugging
5. **Monitor transaction success rates**
6. **Set up alerts** for failed payments
7. **Provide clear error messages** to users

## 🎉 Next Steps

1. Follow the implementation files below
2. Test with test cards
3. Set up webhooks
4. Complete business verification
5. Switch to live keys
6. Monitor transactions

Your Paystack integration is ready! 🚀
