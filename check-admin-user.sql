-- Check all users and their admin status
SELECT id, email, is_admin, created_at 
FROM users 
ORDER BY created_at DESC;

-- Specifically check the admin user
SELECT id, email, is_admin 
FROM users 
WHERE email = 'admin@spookystyles.com';
