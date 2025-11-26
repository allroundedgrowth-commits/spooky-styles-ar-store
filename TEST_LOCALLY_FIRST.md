# Test Locally Before Deploying

Quick guide to test Paystack integration on your local machine first.

## 1. Update Your .env File

Add these to your `.env` file in the root:

```env
# Paystack Configuration (Test Keys)
PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key
PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback
```

Add to `frontend/.env`:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key
```

## 2. Get Your Test Keys

1. Go to https://paystack.com
2. Sign up (free, no credit card needed)
3. Go to Settings → API Keys & Webhooks
4. Copy your **Test Keys** (they start with `pk_test_` and `sk_test_`)
5. Paste them in your `.env` files above

## 3. Start Your Local Servers

```bash
# Make sure Docker is running for database
docker-compose up -d

# Start both frontend and backend
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 4. Test the Payment Flow

1. Open http://localhost:3000
2. Register a new account
3. Browse products
4. Add items to cart
5. Go to checkout
6. Click "Pay with Paystack"
7. Use test card:
   - **Card Number**: `4084 0840 8408 4081`
   - **CVV**: `408`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **PIN**: `0000`
   - **OTP**: `123456`

## 5. Verify It Works

After payment:
- You should see order confirmation
- Check backend logs for payment success
- Order status should be "processing"

## 6. Common Issues

### "Paystack is not defined"
- Make sure you added `VITE_PAYSTACK_PUBLIC_KEY` to `frontend/.env`
- Restart frontend server

### "Payment initialization failed"
- Check backend logs
- Verify `PAYSTACK_SECRET_KEY` in root `.env`
- Make sure backend is running

### "CORS error"
- Check `CORS_ORIGIN` in `.env` is set to `http://localhost:3000`

## 7. Once Local Testing Works

Follow **DEPLOY_NOW.md** to deploy online!

## Quick Commands Reference

```bash
# Start everything
npm run dev

# Stop Docker services
docker-compose down

# View backend logs
# (Check terminal where npm run dev is running)

# Restart if you change .env
# Stop with Ctrl+C, then run npm run dev again
```

## Test Cards for Different Scenarios

### Successful Payment
- Card: `4084 0840 8408 4081`
- CVV: `408`
- PIN: `0000`
- OTP: `123456`

### Insufficient Funds
- Card: `5060 6666 6666 6666 6666`
- CVV: `123`
- PIN: `1234`

### Declined
- Card: `5060 0000 0000 0000 0000`
- CVV: `123`

Test all scenarios to make sure your error handling works!

## ✅ Ready to Deploy?

Once everything works locally, follow **DEPLOY_NOW.md** to go live!
