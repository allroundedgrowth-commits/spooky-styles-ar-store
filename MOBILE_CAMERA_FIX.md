# Mobile Camera Access Fix

## Problem
Camera not working on mobile phones when testing the AR try-on feature.

## Root Cause
Mobile browsers (iOS Safari, Chrome, etc.) **require HTTPS** for camera access due to security policies. The development server was running on HTTP.

## Solutions

### Option 1: Use HTTPS on Local Network (Recommended for Testing)

1. **Start the frontend with HTTPS enabled:**
   ```bash
   cd frontend
   VITE_HTTPS=true npm run dev
   ```

2. **Access from your phone:**
   - Find your computer's local IP address:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`
   - On your phone, navigate to: `https://YOUR_IP:5173`
   - Example: `https://192.168.1.100:5173`

3. **Accept the security warning:**
   - You'll see a "Not Secure" or "Certificate Invalid" warning
   - This is normal for self-signed certificates
   - Click "Advanced" → "Proceed anyway" (or similar)

4. **Grant camera permissions when prompted**

### Option 2: Use ngrok for Public HTTPS URL

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm
   npm install -g ngrok
   ```

2. **Start your dev server normally:**
   ```bash
   npm run dev
   ```

3. **Create HTTPS tunnel:**
   ```bash
   ngrok http 5173
   ```

4. **Use the HTTPS URL provided by ngrok on your phone**
   - Example: `https://abc123.ngrok.io`

### Option 3: Upload Photo Instead (No HTTPS Required)

The AR try-on page has an "Upload Your Photo" option that works without camera access:

1. Take a selfie with your phone's camera app
2. Open the AR try-on page
3. Click "📤 Upload Your Photo"
4. Select the selfie you just took
5. Try on wigs without needing live camera access

## Code Changes Made

### 1. Enhanced Mobile Compatibility (`Simple2DAREngine.ts`)

- Added mobile device detection
- Simplified camera constraints for mobile browsers
- Added fallback to basic constraints if ideal constraints fail
- Added iOS-specific video attributes (`playsinline`, `webkit-playsinline`)
- Improved error messages for common camera issues

### 2. HTTPS Support (`vite.config.ts`)

- Added optional HTTPS support via `VITE_HTTPS` environment variable
- Maintains HTTP as default for desktop development
- Easy to enable for mobile testing

## Testing on Mobile

### iOS (Safari/Chrome)
1. Ensure you're using HTTPS (Option 1 or 2 above)
2. When prompted, tap "Allow" for camera access
3. If denied, go to Settings → Safari → Camera → Allow

### Android (Chrome/Firefox)
1. Ensure you're using HTTPS (Option 1 or 2 above)
2. When prompted, tap "Allow" for camera access
3. If denied, go to Site Settings → Permissions → Camera → Allow

## Quick Start Commands

### Desktop Testing (HTTP - works fine)
```bash
npm run dev
# Access at http://localhost:5173
```

### Mobile Testing (HTTPS - required for camera)
```bash
cd frontend
VITE_HTTPS=true npm run dev
# Access at https://YOUR_IP:5173 from phone
```

### Production (Always HTTPS)
```bash
npm run build
npm run start --workspace=backend
# Deploy to hosting with HTTPS (Vercel, Netlify, etc.)
```

## Browser Compatibility

| Browser | Camera Support | Notes |
|---------|---------------|-------|
| iOS Safari | ✅ HTTPS only | Requires iOS 11+ |
| iOS Chrome | ✅ HTTPS only | Uses Safari engine |
| Android Chrome | ✅ HTTPS only | Best performance |
| Android Firefox | ✅ HTTPS only | Good support |
| Desktop Chrome | ✅ HTTP/HTTPS | Full support |
| Desktop Firefox | ✅ HTTP/HTTPS | Full support |
| Desktop Safari | ✅ HTTP/HTTPS | macOS only |

## Troubleshooting

### "Camera access denied"
- Check browser permissions
- Try reloading the page
- Clear browser cache
- Use "Upload Photo" option instead

### "No camera found"
- Ensure device has a camera
- Check if another app is using the camera
- Restart the browser

### "Camera already in use"
- Close other apps using the camera
- Close other browser tabs with camera access
- Restart the browser

### "HTTPS required" error
- Use Option 1 or 2 above to enable HTTPS
- Or use "Upload Photo" option

### Certificate warning on mobile
- This is normal for self-signed certificates
- Safe to proceed for local testing
- Production deployments use proper certificates

## Production Deployment

For production, always use a hosting service with automatic HTTPS:

- **Vercel** (recommended for frontend)
- **Netlify**
- **AWS CloudFront + S3**
- **Heroku**
- **Railway**

All these services provide free HTTPS certificates automatically.

## Additional Notes

- The "Upload Photo" feature is actually recommended over live camera for best results
- Users can take a well-lit, well-positioned photo first
- Then upload it for perfect wig try-on experience
- No HTTPS required for photo upload!
