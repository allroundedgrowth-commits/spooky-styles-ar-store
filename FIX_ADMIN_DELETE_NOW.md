# Fix Admin Delete - 403 Forbidden Error

## 🔴 The Problem
Error: `403 (Forbidden)` when trying to delete products

This means you're logged in, but your user account is **not marked as admin** in the database.

## ✅ The Fix (2 Steps)

### Step 1: Connect to PostgreSQL

**Option A - Using psql:**
```bash
psql -U postgres -d spookywigs
```

**Option B - Using pgAdmin or any PostgreSQL client**

### Step 2: Run This SQL Command

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@spookystyles.com';
```

**Verify it worked:**
```sql
SELECT email, is_admin FROM users WHERE email = 'admin@spookystyles.com';
```

You should see:
```
email                    | is_admin
-------------------------+----------
admin@spookystyles.com   | t
```

## 🎯 Alternative: Use the Script

If you have the backend running, you can also run:

```bash
cd backend
npx tsx src/db/create-admin.ts
```

This will ensure the admin user exists and has admin privileges.

## 🧪 Test It

1. **Logout and login again** in the browser
   - Go to http://localhost:5173/account
   - Logout if logged in
   - Login with:
     - Email: admin@spookystyles.com
     - Password: Admin123!

2. **Go to Admin Dashboard**

3. **Try to delete a product**
   - Should work now! ✅

## 🔍 Why This Happened

The user account exists but the `is_admin` flag was set to `false` (or NULL). The admin middleware checks this flag before allowing delete operations.

## ⚡ Quick Command (Copy-Paste)

If you're using psql:
```bash
psql -U postgres -d spookywigs -c "UPDATE users SET is_admin = true WHERE email = 'admin@spookystyles.com';"
```

## ✅ Done!

After running the SQL command:
1. Logout from the frontend
2. Login again
3. Delete should work!

---

**Note:** You need to logout and login again for the new permissions to take effect in the JWT token.
