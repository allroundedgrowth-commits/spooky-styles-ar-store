-- Quick fix: Ensure admin user has proper permissions
-- Run this if you get 403 Forbidden errors when trying to delete

-- Make sure the admin user exists and has admin privileges
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@spookystyles.com';

-- Verify the change
SELECT id, email, is_admin, created_at 
FROM users 
WHERE email = 'admin@spookystyles.com';

-- If no rows returned, create the admin user:
-- cd backend && npx tsx src/db/create-admin.ts
