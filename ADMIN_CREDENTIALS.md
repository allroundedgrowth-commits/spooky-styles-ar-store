# 🎃 Admin Login Credentials

## Current Admin Account

**Email:** `admin@spookystyles.com`  
**Password:** `Admin123!`

## Login URL

http://localhost:3001/account

## Testing

Backend API is working correctly. If frontend login fails:

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab to see if API calls are being made
4. Verify the request goes to: `http://localhost:5000/api/auth/login`

## Troubleshooting

If you see CORS errors:
- Backend CORS is configured for `http://localhost:3001`
- Make sure frontend is running on port 3001

If you see "Invalid email or password":
- Double-check you're using the exact credentials above
- Email and password are case-sensitive

## Backend Test

You can test the backend directly:
```bash
node test-admin-login.js
```

This should show "✅ Login successful!"
