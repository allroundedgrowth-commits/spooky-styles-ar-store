# AR Try-On Not Working - Diagnosis & Fix

## Problem
The AR try-on page shows neither the camera feed nor the wig overlay.

## Root Causes Identified

### 1. **Canvas Not Visible Until Initialized**
The canvas element is hidden until `isInitialized` is true, but initialization might be failing silently.

### 2. **Video Element Always Hidden**
The video element has `className="hidden"` in both states, so the camera feed is never visible for debugging.

### 3. **Rendering Loop May Not Start**
The `loadWig()` function should call `startRendering()`, but there might be timing issues or errors preventing it.

### 4. **MediaPipe Initialization Failures**
MediaPipe Face Mesh might fail to load, causing the engine to fall back to basic detection without proper error handling.

## Quick Diagnostic Steps

### Step 1: Open Browser Console
1. Open the AR try-on page
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors related to:
   - Camera permissions
   - MediaPipe loading
   - Canvas rendering
   - Image loading

### Step 2: Check Camera Permissions
1. Look for browser permission prompt
2. Check if camera access was denied
3. Try allowing camera in browser settings

### Step 3: Use Debug Test Page
Open `test-ar-debug.html` in your browser and run each test:
1. Test Camera Access
2. Test Canvas Drawing
3. Test Wig Image Load
4. Test Full AR

## Fixes Applied

### Fix 1: Canvas Visibility
Changed canvas to use inline styles for better control:
```typescript
<canvas
  style={{ display: isInitialized ? 'block' : 'none' }}
/>
```

### Fix 2: Add Debug Logging
Need to add console.log statements to track initialization flow.

### Fix 3: Error Handling
Need to ensure errors are properly displayed to the user.

## Next Steps

### If Camera Shows But No Wig:
1. Check if wig image URL is valid
2. Check browser console for image loading errors
3. Verify `loadWig()` is being called
4. Check if rendering loop is running

### If Nothing Shows:
1. Check camera permissions
2. Try the debug test page
3. Check if HTTPS is required (mobile)
4. Try uploading a photo instead

### If Face Not Detected:
1. Ensure good lighting
2. Face camera directly
3. Check if MediaPipe loaded successfully
4. Try the fallback detection mode

## Common Issues

### Issue: "Camera access requires HTTPS"
**Solution**: Use the "Upload Photo" option instead, or access via HTTPS.

### Issue: "Camera blocked"
**Solution**: 
1. Click the camera icon in browser address bar
2. Allow camera access
3. Refresh the page

### Issue: "Wig not loading"
**Solution**:
1. Check product has valid image URLs
2. Check browser console for CORS errors
3. Verify images are accessible

### Issue: "Black screen"
**Solution**:
1. Check if canvas is rendering (use debug page)
2. Verify video stream is active
3. Check if rendering loop is running

## Testing Commands

```bash
# Start the app
npm run dev

# Open in browser
http://localhost:3000/ar-tryon/:productId

# Or use demo mode (no product ID)
http://localhost:3000/ar-tryon
```

## Debug Test Page

Open `test-ar-debug.html` directly in browser to test each component independently.
