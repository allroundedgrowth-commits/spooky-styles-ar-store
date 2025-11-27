# Supabase Testing Guide

This guide provides manual testing procedures for the Supabase enhancements implementation.

## Test Suite 7.1: RLS Policies Testing

### Requirements Tested
- 1.1: RLS enforcement on sensitive tables
- 1.2: User data access policies
- 1.3: Order access policies  
- 1.4: Admin access policies
- 1.5: Default deny policies

### Prerequisites
1. Supabase project is configured with correct credentials
2. RLS migration has been run (`npm run db:rls-migration --workspace=backend`)
3. At least 2 test users and 1 admin user exist in the database

### Test 1.2.1: Users Can View Their Own User Record

**Steps:**
1. Log in as User A
2. Navigate to Account page
3. Verify user profile information is displayed

**Expected Result:** ✅ User A can see their own profile data

**Actual Result:** _____________________

---

### Test 1.2.2: Users Cannot View Other Users' Records

**Steps:**
1. Log in as User A
2. Open browser developer tools
3. Try to query another user's data via Supabase client:
   ```javascript
   const { data } = await supabase
     .from('users')
     .select('*')
     .eq('id', 'other-user-id');
   console.log(data);
   ```

**Expected Result:** ✅ Returns null or empty array (RLS blocks access)

**Actual Result:** _____________________

---

### Test 1.3.1: Users Can View Their Own Orders

**Steps:**
1. Log in as User A (who has placed orders)
2. Navigate to Order History page
3. Verify orders are displayed

**Expected Result:** ✅ User A sees their own orders

**Actual Result:** _____________________

---

### Test 1.3.2: Users Cannot View Other Users' Orders

**Steps:**
1. Log in as User A
2. Note an order ID from User B (get from database or admin panel)
3. Try to query that order via developer console:
   ```javascript
   const { data } = await supabase
     .from('orders')
     .select('*')
     .eq('id', 'user-b-order-id');
   console.log(data);
   ```

**Expected Result:** ✅ Returns null (RLS blocks access)

**Actual Result:** _____________________

---

### Test 1.4.1: Admins Can View All Orders

**Steps:**
1. Log in as Admin user
2. Navigate to Admin Dashboard
3. View Orders section
4. Verify all orders from all users are visible

**Expected Result:** ✅ Admin sees orders from all users

**Actual Result:** _____________________

---

### Test 1.4.2: Admins Can Update Any Order

**Steps:**
1. Log in as Admin user
2. Navigate to Admin Dashboard > Orders
3. Select an order from any user
4. Update the order status (e.g., from "pending" to "processing")
5. Save changes

**Expected Result:** ✅ Order status updates successfully

**Actual Result:** _____________________

---

### Test 1.4.3: Public Read Access to Products

**Steps:**
1. Open the website without logging in
2. Navigate to Products page
3. Verify products are displayed

**Expected Result:** ✅ Products are visible to unauthenticated users

**Actual Result:** _____________________

---

### Test 1.4.4: Non-Admins Cannot Modify Products

**Steps:**
1. Log in as regular user (non-admin)
2. Try to access Admin Dashboard
3. Verify access is denied

**Expected Result:** ✅ Regular users cannot access admin functions

**Actual Result:** _____________________

---

### Test 1.4.5: Admins Can Modify Products

**Steps:**
1. Log in as Admin user
2. Navigate to Admin Dashboard > Products
3. Edit a product (change name, price, or description)
4. Save changes
5. Verify changes are reflected

**Expected Result:** ✅ Product updates successfully

**Actual Result:** _____________________

---

### Test 1.5.1: RLS Denies Access By Default

**Steps:**
1. Open website without logging in
2. Open browser developer console
3. Try to query orders:
   ```javascript
   const { data } = await supabase
     .from('orders')
     .select('*');
   console.log(data);
   ```

**Expected Result:** ✅ Returns empty array or null (no access without auth)

**Actual Result:** _____________________

---

## Test Suite 7.2: Realtime Inventory Updates

### Requirements Tested
- 2.1: Stock updates broadcast to clients
- 2.2: Realtime subscriptions for products
- 2.3: Connection establishment
- 2.4: Connection recovery
- 2.5: UI integration

### Test 2.1.1: Stock Updates Broadcast to All Clients

**Steps:**
1. Open Product Detail page in Browser A
2. Open same Product Detail page in Browser B
3. In Admin Dashboard (Browser C), update the product's stock quantity
4. Observe both Browser A and B

**Expected Result:** ✅ Both browsers show updated stock within 1 second

**Actual Result:** _____________________

---

### Test 2.2.1: Realtime Subscription Established

**Steps:**
1. Open Product Detail page
2. Open browser developer console
3. Check for Realtime connection messages
4. Look for "Connected to realtime" or similar log

**Expected Result:** ✅ Realtime connection established successfully

**Actual Result:** _____________________

---

### Test 2.3.1: Connection Status Indicator

**Steps:**
1. Open Product Detail page
2. Look for connection status indicator (usually in header/footer)
3. Verify it shows "Connected" or similar

**Expected Result:** ✅ Connection status shows as connected

**Actual Result:** _____________________

---

### Test 2.4.1: Connection Recovery After Loss

**Steps:**
1. Open Product Detail page
2. Verify Realtime is connected
3. Disable network in browser (DevTools > Network > Offline)
4. Wait 5 seconds
5. Re-enable network
6. Observe connection status

**Expected Result:** ✅ Connection automatically reconnects

**Actual Result:** _____________________

---

### Test 2.5.1: Out of Stock Display

**Steps:**
1. Open Product Detail page for a product
2. In Admin Dashboard, set stock quantity to 0
3. Observe Product Detail page

**Expected Result:** ✅ "Out of Stock" message appears, "Add to Cart" button disabled

**Actual Result:** _____________________

---

### Test 2.5.2: Multiple Users Receive Same Update

**Steps:**
1. Open Product Detail page in 3 different browsers
2. In Admin Dashboard, update stock from 10 to 5
3. Observe all 3 browsers

**Expected Result:** ✅ All 3 browsers show stock as 5 within 1 second

**Actual Result:** _____________________

---

## Test Suite 7.3: Realtime Order Notifications

### Requirements Tested
- 3.1: Order status change notifications
- 3.2: RLS filtering for order updates
- 3.3: Order history subscriptions
- 3.4: Subscription cleanup
- 3.5: Error handling

### Test 3.1.1: Order Status Change Triggers Notification

**Steps:**
1. Log in as User A
2. Place an order
3. Navigate to Order History page
4. In Admin Dashboard (different browser), update the order status to "shipped"
5. Observe User A's Order History page

**Expected Result:** ✅ Notification appears showing order status changed to "shipped" within 2 seconds

**Actual Result:** _____________________

---

### Test 3.2.1: Users Only Receive Their Own Order Updates

**Steps:**
1. Log in as User A in Browser A
2. Log in as User B in Browser B
3. Both navigate to Order History
4. In Admin Dashboard, update User A's order status
5. Observe both browsers

**Expected Result:** ✅ Only User A receives notification, User B does not

**Actual Result:** _____________________

---

### Test 3.3.1: Order History Real-Time Updates

**Steps:**
1. Log in as User A
2. Navigate to Order History page
3. In Admin Dashboard, update one of User A's orders
4. Observe Order History page

**Expected Result:** ✅ Order list updates in real-time without page refresh

**Actual Result:** _____________________

---

### Test 3.4.1: Subscription Cleanup on Navigation

**Steps:**
1. Log in as User A
2. Navigate to Order History page
3. Open browser developer console
4. Check for active Realtime subscriptions
5. Navigate away to Products page
6. Check subscriptions again

**Expected Result:** ✅ Subscriptions are cleaned up when leaving page

**Actual Result:** _____________________

---

### Test 3.5.1: Graceful Error Handling

**Steps:**
1. Log in as User A
2. Navigate to Order History page
3. Disable network (DevTools > Network > Offline)
4. Wait 10 seconds
5. Re-enable network

**Expected Result:** ✅ No crashes, connection recovers gracefully

**Actual Result:** _____________________

---

### Test 3.5.2: Notification Display Format

**Steps:**
1. Log in as User A
2. Navigate to Order History page
3. In Admin Dashboard, update order status
4. Observe notification

**Expected Result:** ✅ Notification shows order ID and new status clearly

**Actual Result:** _____________________

---

## Test Summary

### RLS Policies (7.1)
- Total Tests: 10
- Passed: _____
- Failed: _____
- Notes: _____________________

### Realtime Inventory (7.2)
- Total Tests: 6
- Passed: _____
- Failed: _____
- Notes: _____________________

### Realtime Orders (7.3)
- Total Tests: 6
- Passed: _____
- Failed: _____
- Notes: _____________________

### Overall
- Total Tests: 22
- Passed: _____
- Failed: _____
- Success Rate: _____%

## Notes and Issues

_Record any issues, unexpected behavior, or additional observations here:_

---

## Automated Test Scripts

For automated testing, you can run:

```bash
# RLS Policies Test
npm run test:rls --workspace=backend

# Note: Realtime tests require manual verification due to WebSocket complexity
```

## Conclusion

Date Tested: _____________________
Tested By: _____________________
Overall Status: ☐ PASS ☐ FAIL ☐ PARTIAL

Signature: _____________________
