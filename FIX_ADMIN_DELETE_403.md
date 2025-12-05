# Fix Admin Delete 403 Error

## Problem
When trying to delete a product from the admin dashboard, you get:
```
403 (Forbidden)
CSRF token missing
```

## Root Cause
You logged in **before** the CSRF token handling was implemented. Your browser session doesn't have a CSRF token stored in localStorage.

## Solution

### Option 1: Log Out and Back In (Recommended)

1. **Go to the admin dashboard**
2. **Click "Logout"** (or go to http://localhost:3001/account and logout)
3. **Log back in** with:
   - Email: `admin@spookystyles.com`
   - Password: `admin123`
4. **Try deleting again** - Should work now! ✅

### Option 2: Clear Browser Storage

If logout doesn't work:

1. **Open Browser DevTools** (F12)
2. **Go to Application tab** (Chrome) or Storage tab (Firefox)
3. **Click "Local Storage"** → `http://localhost:3001`
4. **Delete these keys:**
   - `auth_token`
   - `csrf_token` (if it exists)
5. **Refresh the page**
6. **Log in again**

### Option 3: Manual CSRF Token (Quick Fix)

If you need to delete right now without logging out:

1. **Open Browser Console** (F12 → Console tab)
2. **Run this code:**
```javascript
fetch('http://localhost:3000/api/auth/csrf-token', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('csrf_token', data.csrfToken);
  console.log('✅ CSRF token saved! Refresh the page and try again.');
});
```
3. **Refresh the page**
4. **Try deleting again**

## Why This Happened

The CSRF protection was recently added to secure the API. When you logged in before this change, your session didn't get a CSRF token. The new code automatically fetches CSRF tokens on login, but existing sessions need to be refreshed.

## Verification

After logging back in, check that you have the CSRF token:

1. **Open Browser Console** (F12)
2. **Run:** `localStorage.getItem('csrf_token')`
3. **Should see:** A long hexadecimal string (not `null`)

If you see `null`, the token wasn't fetched. Try logging out and in again.

## For Future Sessions

This won't happen again! The system now:
- ✅ Automatically fetches CSRF token on login
- ✅ Automatically includes it in all create/update/delete requests
- ✅ Refreshes it when you log in again

## Still Having Issues?

If you still get 403 after logging out and back in:

1. **Check backend is running:**
   ```bash
   docker ps
   ```
   Should see `spooky-styles-backend` running

2. **Check backend logs:**
   ```bash
   docker logs spooky-styles-backend --tail 30
   ```

3. **Verify you're admin:**
   ```bash
   node check-users.js
   ```
   Should show `admin@spookystyles.com` with `Admin: ✅ YES`

4. **Test API directly:**
   ```bash
   node test-delete-with-csrf.js
   ```
   Should show `✅ Product deleted successfully!`

If the API test works but frontend doesn't, it's a frontend caching issue. Clear all browser data for localhost:3001 and try again.
