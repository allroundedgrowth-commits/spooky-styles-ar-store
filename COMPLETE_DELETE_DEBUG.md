# Complete Delete Debugging Guide

## Current Status
- ✅ Database has `is_admin = true`
- ✅ JWT token includes `isAdmin` field
- ✅ Backend code updated
- ❌ Still getting 403 Forbidden

## 🔍 Debug Steps

### Step 1: Restart Backend
The backend MUST be restarted for the new logging to work:
```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

### Step 2: Check Backend Console
When you try to delete, you should see logs like:
```
[AdminMiddleware] Checking admin access for userId: <some-id>
[AdminMiddleware] Database query result: [...]
[AdminMiddleware] User found: admin@spookystyles.com is_admin: true
[AdminMiddleware] ✅ Admin access granted
```

If you see:
- `❌ No userId in request` → Auth token not being sent
- `❌ User not found` → Wrong user ID in token
- `❌ User is NOT admin` → Database still has false
- `❌ Error:` → Some other error

### Step 3: Check Browser Console
In browser DevTools (F12), Console tab, run:
```javascript
// Check if token exists
const token = localStorage.getItem('auth_token');
console.log('Token exists:', !!token);

// Decode and check token
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('userId:', payload.userId);
  console.log('isAdmin:', payload.isAdmin);
}
```

### Step 4: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to delete a product
4. Find the DELETE request
5. Click on it
6. Check:
   - **Request Headers** → Is `Authorization: Bearer ...` present?
   - **Response** → What's the exact error message?

### Step 5: Verify Database
Run this SQL:
```sql
SELECT id, email, is_admin FROM users WHERE email = 'admin@spookystyles.com';
```

Should show `is_admin: t` (true)

## 🎯 Most Likely Issues

### Issue A: Token Not Sent
**Symptom**: Backend logs show "No userId in request"

**Fix**: 
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Verify token exists: `localStorage.getItem('auth_token')`

### Issue B: Wrong User ID
**Symptom**: Backend logs show "User not found"

**Fix**: The token has a different user ID than what's in database
1. Check token userId vs database id
2. Might need to recreate admin user

### Issue C: Database Still False
**Symptom**: Backend logs show "User is NOT admin"

**Fix**:
```sql
UPDATE users SET is_admin = true WHERE email = 'admin@spookystyles.com';
```

### Issue D: CORS/Network Error
**Symptom**: Request doesn't reach backend at all

**Fix**: Check if backend is running on correct port (5000)

## 📋 Checklist

Before asking for more help, verify:

- [ ] Backend is running and restarted after code changes
- [ ] Backend console shows the new `[AdminMiddleware]` logs
- [ ] localStorage.clear() was run
- [ ] Logged in again after clearing
- [ ] Token exists in localStorage
- [ ] Token has `isAdmin: true` in payload
- [ ] Database shows `is_admin = true`
- [ ] Network tab shows DELETE request being sent
- [ ] Authorization header is present in request

## 🚨 Share This Info

If still not working, share:
1. **Backend console output** when you try to delete
2. **Browser console output** from the token check
3. **Network tab** screenshot of the DELETE request
4. **Database query result** for the admin user

This will pinpoint the exact issue!
