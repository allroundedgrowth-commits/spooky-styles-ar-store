# Admin Product Delete Fix

## Issue
Admin users cannot delete products from the dashboard.

## Root Cause Analysis

The delete functionality exists in:
1. ✅ Backend route: `DELETE /api/products/:id`
2. ✅ Backend service: `productService.deleteProduct()`
3. ✅ Frontend service: `adminService.deleteProduct()`
4. ✅ Frontend UI: Delete button in ProductList
5. ✅ Database constraints: Proper CASCADE/SET NULL

## Debugging Steps

### 1. Check Backend Logs
When attempting to delete, check the backend console for:
```
[ProductService] Attempting to delete product: <id>
[ProductService] Product found: <name>
[ProductService] Delete query executed, rows affected: 1
[ProductService] Product deleted successfully: <id>
```

If you see errors, they will indicate the issue.

### 2. Check Frontend Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click delete button
4. Look for DELETE request to `/api/products/<id>`
5. Check:
   - Status code (should be 200)
   - Request headers (Authorization header present?)
   - Response body

### 3. Verify Admin Status
```sql
-- Check if your user is admin
SELECT id, email, is_admin FROM users WHERE email = 'admin@spookystyles.com';
```

Should show `is_admin: true`

### 4. Test Backend Directly

Create a test file `test-delete-direct.js`:
```javascript
const API_URL = 'http://localhost:5000/api';

async function testDelete() {
  // 1. Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@spookystyles.com',
      password: 'Admin123!'
    })
  });
  
  const { data } = await loginRes.json();
  const token = data.token;
  
  // 2. Get products
  const productsRes = await fetch(`${API_URL}/products`);
  const { data: products } = await productsRes.json();
  const productId = products[0].id;
  
  // 3. Delete
  const deleteRes = await fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Status:', deleteRes.status);
  console.log('Response:', await deleteRes.json());
}

testDelete();
```

Run: `node test-delete-direct.js`

## Common Issues & Fixes

### Issue 1: 401 Unauthorized
**Cause**: Auth token not being sent or expired

**Fix**: Check localStorage in browser:
```javascript
// In browser console
console.log(localStorage.getItem('auth_token'));
```

If null, login again.

### Issue 2: 403 Forbidden
**Cause**: User is not admin

**Fix**: Update user to admin:
```sql
UPDATE users SET is_admin = true WHERE email = 'admin@spookystyles.com';
```

### Issue 3: 404 Not Found
**Cause**: Product doesn't exist or cache issue

**Fix**: 
1. Clear Redis cache:
```bash
# In Redis CLI
FLUSHDB
```

2. Or restart backend to clear cache

### Issue 4: 500 Server Error
**Cause**: Database constraint violation

**Fix**: Check backend logs for specific error. Common causes:
- Foreign key constraints
- Trigger errors
- Permission issues

## Quick Fix: Remove Logging

Once debugging is complete, remove the console.log statements from:
`backend/src/services/product.service.ts` in the `deleteProduct` method.

## Testing Checklist

- [ ] Backend server is running
- [ ] Frontend is running
- [ ] Logged in as admin user
- [ ] Admin user has `is_admin = true` in database
- [ ] Auth token is present in localStorage
- [ ] Network request shows Authorization header
- [ ] Backend logs show delete attempt
- [ ] No database constraint errors

## Manual Test Steps

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login as Admin**
   - Go to http://localhost:5173/account
   - Email: admin@spookystyles.com
   - Password: Admin123!

4. **Navigate to Admin Dashboard**
   - Click "Admin Dashboard" link
   - Should see product list

5. **Try to Delete**
   - Click trash icon on any product
   - Confirm deletion in dialog
   - Check if product disappears

6. **Check Backend Console**
   - Should see delete logs
   - No errors

## If Still Not Working

1. **Check browser console** for JavaScript errors
2. **Check backend console** for server errors
3. **Check database** for constraint issues:
   ```sql
   -- Check foreign key constraints
   SELECT 
     tc.constraint_name, 
     tc.table_name, 
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name,
     rc.delete_rule
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   JOIN information_schema.referential_constraints AS rc
     ON rc.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
     AND ccu.table_name = 'products';
   ```

4. **Try deleting via SQL** to test constraints:
   ```sql
   -- This will show any constraint errors
   DELETE FROM products WHERE id = '<some-product-id>';
   ```

## Expected Behavior

When delete works correctly:
1. Click delete button
2. Confirmation dialog appears
3. Click confirm
4. Product disappears from list
5. Success message shows
6. Backend logs show successful deletion
7. Product is removed from database

## Contact

If issue persists after trying all fixes, provide:
- Browser console errors
- Backend console errors
- Network tab screenshot
- Database query results for admin user
