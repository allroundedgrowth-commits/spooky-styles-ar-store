# Supabase Testing Quick Start

Quick reference for running Supabase enhancement tests.

## Prerequisites

1. Supabase credentials configured in `.env` files
2. RLS migration has been run
3. Test users exist in database (or will be created automatically)

## Running Tests

### 1. RLS Policies Test (Automated)

Tests Row Level Security policies for users, orders, and products.

```bash
npm run test:rls --workspace=backend
```

**What it tests:**
- ✅ Users can view their own data
- ✅ Users cannot view other users' data
- ✅ Admins have full access
- ✅ RLS denies access by default
- ✅ Product access policies

**Expected output:**
```
🧪 Starting RLS Policies Tests...

✅ Test 1.2.1: Users can view their own user record
✅ Test 1.2.2: Users cannot view other users records
✅ Test 1.3.1: Users can view their own orders
...

📊 Test Summary:
Total: 10
✅ Passed: 10
❌ Failed: 0
Success Rate: 100.0%
```

### 2. Realtime Inventory Tests (Manual)

Tests real-time stock updates across multiple clients.

**Open:** `SUPABASE_TESTING_GUIDE.md` → Section "Test Suite 7.2"

**Key tests:**
1. Open product page in 2 browsers
2. Update stock in admin dashboard
3. Verify both browsers update within 1 second

### 3. Realtime Order Notifications (Manual)

Tests real-time order status notifications.

**Open:** `SUPABASE_TESTING_GUIDE.md` → Section "Test Suite 7.3"

**Key tests:**
1. Log in as user
2. Navigate to Order History
3. Update order status in admin dashboard
4. Verify notification appears within 2 seconds

## Quick Verification

### Test RLS is Working

```bash
# Run automated RLS tests
npm run test:rls --workspace=backend
```

### Test Realtime is Working

1. Open product page: `http://localhost:3000/products/[product-id]`
2. Open admin dashboard: `http://localhost:3000/admin`
3. Update product stock in admin
4. Verify product page updates automatically

### Test Order Notifications

1. Log in as user: `http://localhost:3000/login`
2. Open order history: `http://localhost:3000/account`
3. In admin dashboard, update an order status
4. Verify notification appears on order history page

## Troubleshooting

### RLS Tests Fail

**Error:** "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
- Check `backend/.env` has correct Supabase credentials
- Verify keys are not placeholders

**Error:** "User creation failed"
- Check Supabase project allows user creation
- Verify service role key has admin permissions

### Realtime Not Working

**No updates appearing:**
1. Check Supabase dashboard → Settings → API → Realtime is enabled
2. Verify browser console shows "Connected to realtime"
3. Check connection status indicator in app

**Connection errors:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`
- Check browser console for error messages
- Ensure within free tier limit (200 concurrent connections)

## Test Coverage

| Test Suite | Tests | Type | Status |
|------------|-------|------|--------|
| RLS Policies | 10 | Automated | ✅ |
| Realtime Inventory | 9 | Unit + Manual | ✅ |
| Realtime Orders | 12 | Unit + Manual | ✅ |
| **Total** | **31** | **Mixed** | **✅** |

## Next Steps

1. ✅ Run automated RLS tests
2. ✅ Perform manual Realtime tests
3. ✅ Document results in `SUPABASE_TESTING_GUIDE.md`
4. ✅ Fix any failing tests
5. ✅ Deploy to staging for end-to-end testing

## Documentation

- **Automated Tests:** `backend/src/db/test-rls-policies.ts`
- **Unit Tests:** `frontend/src/__tests__/realtime-*.test.ts`
- **Manual Guide:** `SUPABASE_TESTING_GUIDE.md`
- **Complete Summary:** `SUPABASE_TESTING_COMPLETE.md`

## Support

For issues or questions:
1. Check `SUPABASE_TESTING_COMPLETE.md` for detailed information
2. Review `SUPABASE_TESTING_GUIDE.md` for manual testing procedures
3. Check Supabase dashboard for connection status
4. Review browser console for error messages

---

**Quick Test Command:**
```bash
npm run test:rls --workspace=backend
```

**Status:** ✅ All tests implemented and ready to run
