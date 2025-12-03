# AR Try-On Diagnostic Guide

## How to Diagnose Issues

### Step 1: Open Browser Console
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Go to the **Console** tab
3. Look for errors (red text)

### Step 2: Check Network Tab
1. Go to **Network** tab in DevTools
2. Reload the page
3. Look for:
   - Failed requests (red status codes: 404, 500, etc.)
   - Slow loading resources
   - CORS errors

### Step 3: Common Issues & Solutions

---

## Issue 1: Page Not Loading / Blank Screen

### Symptoms:
- White/black screen
- Loading spinner forever
- No AR interface

### Check Console For:
```
❌ Failed to load module
❌ Cannot find module
❌ Uncaught TypeError
```

### Possible Causes:
1. **Route mismatch** - URL doesn't match route definition
2. **Component import error** - Missing or incorrect import
3. **JavaScript error** - Syntax or runtime error

### Solutions:
```bash
# Clear browser cache
Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)

# Hard refresh
Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)

# Check if dev server is running
npm run dev
```

---

## Issue 2: Camera Not Working

### Symptoms:
- "Camera access denied" message
- Black video feed
- No camera prompt

### Check Console For:
```
❌ NotAllowedError: Permission denied
❌ NotFoundError: No camera found
❌ NotReadableError: Camera in use
❌ NotSupportedError: HTTPS required
```

### Solutions:

**For Desktop:**
1. Check browser permissions (click lock icon in address bar)
2. Allow camera access
3. Reload page

**For Mobile:**
1. Use HTTPS (camera requires secure connection)
2. Or use "Upload Photo" option instead
3. Check browser settings → Site permissions

---

## Issue 3: Wig Not Showing / Not Positioned Correctly

### Symptoms:
- Video shows but no wig overlay
- Wig in wrong position
- Wig too big/small
- Wig not following face

### Check Console For:
```
❌ Failed to load wig image
❌ MediaPipe initialization failed
❌ Face detection failed
```

### Diagnostic Steps:

**A. Check if wig image loads:**
1. Open Network tab
2. Look for image requests
3. Check if they return 200 (success) or 404 (not found)

**B. Check MediaPipe initialization:**
Look for console messages:
```
✅ MediaPipe Face Mesh initialized
✅ 2D AR Engine initialized
```

If missing:
```
❌ Failed to initialize MediaPipe
```

**C. Check face detection:**
Look for:
```
✅ MediaPipe Active (green indicator in UI)
or
⚠ Basic Tracking (yellow indicator)
```

### Solutions:

**If wig image not loading:**
```javascript
// Check product data in console:
console.log(product);
// Should have: ar_image_url, image_url, or thumbnail_url
```

**If MediaPipe not working:**
- Check internet connection (MediaPipe loads from CDN)
- Try different browser (Chrome/Edge recommended)
- Use "Upload Photo" option as fallback

**If positioning is off:**
- Use the adjustment sliders (Size, Position)
- Click "Auto-Fit" button
- Try "Reset" button

---

## Issue 4: Hair Flattening Not Working

### Symptoms:
- No Volume Score Indicator
- No Adjustment Mode Toggle
- Hair not being detected

### Check Console For:
```
❌ Failed to initialize hair flattening
❌ Hair segmentation model load failed
❌ enableHairFlattening is false
```

### Expected Console Messages:
```
✅ Hair flattening modules initialized successfully
✅ Segmentation complete
✅ Volume score: [number]
```

### Solutions:

**Check if enabled:**
```javascript
// In browser console:
// Should see enableHairFlattening: true in config
```

**Check MediaPipe Selfie Segmentation:**
- Requires internet connection
- Loads from CDN: `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation`
- Check Network tab for failed requests

**Fallback:**
- Hair flattening is optional
- AR try-on works without it
- Manual adjustment controls still available

---

## Issue 5: Performance Issues / Lag

### Symptoms:
- Choppy video
- Slow response
- Browser freezing
- Low FPS

### Check Console For:
```
⚠ FPS: [number] (should be 15+)
⚠ Performance warning
```

### Solutions:

**Reduce quality:**
1. Close other browser tabs
2. Close other applications
3. Try "Upload Photo" instead of camera
4. Disable hair flattening (if enabled)

**Browser optimization:**
- Use Chrome or Edge (best performance)
- Update browser to latest version
- Enable hardware acceleration in browser settings

---

## Issue 6: Image Upload Not Working

### Symptoms:
- Upload button doesn't respond
- Image doesn't load after selection
- Error after upload

### Check Console For:
```
❌ Failed to load image
❌ File size too large
❌ Invalid file type
```

### Solutions:

**File requirements:**
- Format: JPG, PNG, WebP
- Max size: 10MB
- Should contain visible face

**If still failing:**
```javascript
// Check file in console:
console.log(file);
// Should show: name, size, type
```

---

## Debugging Checklist

### Before Testing:
- [ ] Backend server running (`npm run dev:backend`)
- [ ] Frontend server running (`npm run dev:frontend`)
- [ ] Database running (Docker or local PostgreSQL)
- [ ] No console errors on page load

### During Testing:
- [ ] Console tab open
- [ ] Network tab open
- [ ] Note any error messages
- [ ] Try both camera and upload options
- [ ] Test with different products

### Common Error Patterns:

**1. Module not found:**
```
Cannot find module './Simple2DAREngine'
```
**Fix:** Check import paths, run `npm install`

**2. CORS error:**
```
Access to fetch blocked by CORS policy
```
**Fix:** Check backend CORS configuration

**3. 404 Not Found:**
```
GET /api/products/[id] 404
```
**Fix:** Check backend is running, check product ID exists

**4. MediaPipe CDN error:**
```
Failed to load resource: net::ERR_INTERNET_DISCONNECTED
```
**Fix:** Check internet connection

---

## Quick Fixes

### Fix 1: Clear Everything
```bash
# Stop servers
Ctrl+C

# Clear node modules and reinstall
rm -rf node_modules
npm install

# Restart
npm run dev
```

### Fix 2: Reset Browser
```
1. Clear cache and cookies
2. Close all browser tabs
3. Restart browser
4. Try again
```

### Fix 3: Use Upload Instead of Camera
```
If camera issues persist:
1. Click "Upload Your Photo"
2. Select a clear face photo
3. Adjust wig position manually
```

---

## What to Report

If issues persist, provide:

1. **Browser & Version:**
   - Chrome 120, Firefox 121, Safari 17, etc.

2. **Operating System:**
   - Windows 11, macOS 14, Ubuntu 22.04, etc.

3. **Console Errors:**
   - Copy full error messages (red text)

4. **Network Errors:**
   - Screenshot of failed requests in Network tab

5. **Steps to Reproduce:**
   - Exact steps that cause the issue

6. **Expected vs Actual:**
   - What should happen vs what actually happens

---

## Testing URLs

### Test Simple2DAR (with hair flattening):
```
http://localhost:5173/simple-2d-ar-tryon/[product-id]
http://localhost:5173/ar-tryon/[product-id]
```

### Test without product (demo mode):
```
http://localhost:5173/simple-2d-ar-tryon
http://localhost:5173/ar-tryon
```

---

## Expected Behavior

### On Page Load:
1. ✅ Page loads within 2-3 seconds
2. ✅ Two options shown: "Upload Photo" and "Use Camera"
3. ✅ No console errors

### After Clicking "Upload Photo":
1. ✅ File picker opens
2. ✅ After selecting image, AR view initializes
3. ✅ Wig overlays on face
4. ✅ Adjustment controls appear

### After Clicking "Use Camera":
1. ✅ Camera permission prompt (first time)
2. ✅ Video feed starts
3. ✅ MediaPipe initializes (may take 2-3 seconds)
4. ✅ Face tracking starts
5. ✅ Wig overlays and follows face

### With Hair Flattening:
1. ✅ Volume Score Indicator appears (top-right)
2. ✅ Shows score 0-100 and category
3. ✅ If score > 40, auto-flattening message shows
4. ✅ Adjustment Mode Toggle available
5. ✅ Can switch between Normal/Flattened/Enhanced

---

## Performance Benchmarks

### Acceptable:
- **Page Load:** < 3 seconds
- **Camera Init:** < 2 seconds
- **MediaPipe Init:** < 5 seconds
- **FPS:** 15+ (with hair flattening), 30+ (without)
- **Image Upload:** < 1 second

### If Below Benchmarks:
- Check browser performance
- Close other applications
- Try different browser
- Use upload instead of camera
