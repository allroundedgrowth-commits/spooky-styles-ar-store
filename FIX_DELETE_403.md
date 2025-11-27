# Fix 403 Forbidden Error - Quick Solution

## ⚡ One Command Fix

Run this in your terminal:

```bash
cd backend && npx tsx src/db/fix-admin-permissions.ts
```

This will:
1. Connect to your database
2. Set `is_admin = true` for admin@spookystyles.com
3. Confirm the fix

## 🔄 Then Do This

1. **In your browser:**
   - Logout from the admin dashboard
   - Login again with:
     - Email: admin@spookystyles.com
     - Password: Admin123!

2. **Try deleting a product**
   - Should work now! ✅

## 🎯 What Was Wrong

The error `403 Forbidden` means:
- ✅ You were logged in (authentication worked)
- ❌ But your user wasn't marked as admin (authorization failed)

The fix sets the `is_admin` flag to `true` in the database.

## 📝 Manual Fix (Alternative)

If you prefer SQL:

```sql
UPDATE users SET is_admin = true WHERE email = 'admin@spookystyles.com';
```

---

**That's it!** Run the command, logout, login, and delete will work.
