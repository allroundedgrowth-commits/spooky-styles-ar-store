# 2D AR Try-On - Troubleshooting Guide

## Common Issues & Solutions

### ✅ FIXED: "Cannot convert object to primitive value" Error

**Problem:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Uncaught TypeError: Cannot convert object to primitive value
```

**Cause:**
The `Simple2DARTryOn` component was exported as a named export but the lazy import expected a default export.

**Solution:**
Added `export default Simple2DARTryOn;` at the end of the file.

**Status:** ✅ Fixed

---

## Other Potential Issues

### 1. Camera Not Working

**Symptoms:**
- Camera permission denied
- Black screen
- "Camera not available" error

**Solutions:**
- **Use Image Upload Instead**: Click "📤 Upload Your Photo" button
- **Check Browser Permissions**: Settings → Privacy → Camera → Allow
- **Try Different Browser**: Chrome/Edge work best
- **Check Hardware**: Make sure camera is connected and not in use

---

### 2. Image Upload Not Working

**Symptoms:**
- Image doesn't load
- Error message appears
- Nothing happens after selecting file

**Solutions:**
- **Check File Size**: Must be under 10MB
- **Check File Type**: Use JPG, PNG, or WebP
- **Try Different Image**: Some images may be corrupted
- **Refresh Page**: Sometimes helps clear state

---

### 3. Wig Not Showing

**Symptoms:**
- Camera/image loads but no wig appears
- Blank overlay

**Solutions:**
- **Wait a Few Seconds**: Wig image may still be loading
- **Check Product**: Make sure product has an image
- **Adjust Position**: Use the position slider
- **Refresh Page**: Clear cache and try again

---

### 4. Colors Not Changing

**Symptoms:**
- Clicking color swatches doesn't change wig color
- All colors look the same

**Solutions:**
- **Wait for Load**: Make sure wig is fully loaded first
- **Try Different Colors**: Some colors may be similar
- **Check Product**: Make sure product has color options
- **Refresh and Retry**: Clear state and start over

---

### 5. Screenshot Not Working

**Symptoms:**
- Screenshot button doesn't work
- Image doesn't download
- Blank screenshot

**Solutions:**
- **Check Browser Permissions**: Allow downloads
- **Try Different Browser**: Some browsers block downloads
- **Check Canvas**: Make sure AR view is visible
- **Manual Screenshot**: Use OS screenshot tool instead

---

### 6. Performance Issues

**Symptoms:**
- Slow/laggy rendering
- Low frame rate
- Browser freezing

**Solutions:**
- **Close Other Tabs**: Free up memory
- **Use Image Upload**: Less resource-intensive than camera
- **Lower Image Size**: Use smaller images
- **Try Different Browser**: Chrome usually performs best
- **Check System Resources**: Close other applications

---

### 7. 404 Error on Page Load

**Symptoms:**
- Page not found
- Routing error
- Blank page

**Solutions:**
- **Check URL**: Should be `/ar-tryon-2d/:id` (e.g., `/ar-tryon-2d/1`)
- **Check Product ID**: Make sure product exists
- **Restart Server**: Stop and restart frontend
- **Clear Cache**: Hard refresh (Ctrl+Shift+R)

---

## Browser Compatibility

### ✅ Fully Supported
- Chrome 90+ (Desktop & Mobile)
- Edge 90+ (Desktop)
- Firefox 88+ (Desktop & Mobile)
- Safari 14+ (Desktop & iOS)

### ⚠️ Partial Support
- Opera 76+
- Samsung Internet 14+
- UC Browser (limited)

### ❌ Not Supported
- Internet Explorer (any version)
- Very old browsers (pre-2020)

---

## Quick Fixes

### Fix 1: Hard Refresh
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Fix 2: Clear Browser Cache
```
Chrome: Settings → Privacy → Clear browsing data
Firefox: Settings → Privacy → Clear Data
Safari: Develop → Empty Caches
```

### Fix 3: Restart Servers
```bash
# Stop processes
# Then restart:
cd backend
npm run dev

cd frontend
npm run dev
```

### Fix 4: Check Console
```
F12 → Console tab
Look for error messages
Copy and search for solutions
```

---

## Error Messages Explained

### "Failed to access camera"
- **Meaning**: Browser can't access webcam
- **Fix**: Use image upload instead or check permissions

### "Failed to load image"
- **Meaning**: Image file couldn't be loaded
- **Fix**: Try different image or check file format

### "Failed to load wig"
- **Meaning**: Product image couldn't be loaded
- **Fix**: Check product has valid image URL

### "Engine not initialized"
- **Meaning**: AR engine didn't start properly
- **Fix**: Refresh page and try again

### "Product not found"
- **Meaning**: Invalid product ID in URL
- **Fix**: Go back to products page and select valid product

---

## Debug Mode

### Enable Console Logging
Open browser console (F12) to see detailed logs:
- Camera initialization status
- Image load events
- Wig overlay status
- Error details

### Check Network Tab
F12 → Network tab to see:
- API requests
- Image loading
- Failed requests
- Response codes

---

## Getting Help

### Before Reporting Issues
1. ✅ Check this troubleshooting guide
2. ✅ Try the quick fixes above
3. ✅ Check browser console for errors
4. ✅ Try different browser
5. ✅ Try image upload instead of camera

### When Reporting Issues
Include:
- Browser name and version
- Operating system
- Error message (from console)
- Steps to reproduce
- Screenshot of issue
- Product ID you're trying

---

## Known Limitations

### Current Limitations
1. **Face Detection**: Uses placeholder (centered position)
   - **Workaround**: Manually adjust position slider

2. **Color Tinting**: Basic implementation
   - **Workaround**: Try different colors to find best match

3. **No Rotation**: Front view only
   - **Workaround**: Use photo taken from front

4. **Single Layer**: One wig image only
   - **Workaround**: Product images should be complete

### Coming Soon
- MediaPipe face detection (accurate positioning)
- Better color blending algorithm
- Rotation support
- Multiple wig layers
- Side/back views

---

## Performance Tips

### For Best Performance
1. **Use Image Upload**: Faster than live camera
2. **Close Other Tabs**: Free up memory
3. **Use Chrome**: Best performance
4. **Smaller Images**: Under 2MB recommended
5. **Good Lighting**: Helps with rendering

### Recommended Specs
- **RAM**: 4GB minimum, 8GB recommended
- **Browser**: Chrome 90+ or equivalent
- **Connection**: Any (works offline after load)
- **Camera**: Not required (use upload)

---

## Testing Checklist

### Before Using
- [ ] Browser is up to date
- [ ] JavaScript is enabled
- [ ] Cookies/storage allowed
- [ ] Pop-ups allowed (for downloads)

### During Use
- [ ] Product page loads correctly
- [ ] AR button is visible
- [ ] Upload or camera works
- [ ] Wig appears on image
- [ ] Colors change correctly
- [ ] Sliders adjust position/size
- [ ] Screenshot downloads

### If Issues
- [ ] Check console for errors
- [ ] Try hard refresh
- [ ] Try different browser
- [ ] Try image upload
- [ ] Clear cache
- [ ] Restart servers

---

## Quick Reference

### URLs
- **Products**: http://localhost:3001/products
- **2D AR**: http://localhost:3001/ar-tryon-2d/:id
- **Example**: http://localhost:3001/ar-tryon-2d/1

### Keyboard Shortcuts
- **F12**: Open developer tools
- **Ctrl+Shift+R**: Hard refresh
- **Ctrl+Shift+I**: Inspect element
- **Ctrl+Shift+C**: Select element

### File Limits
- **Max Size**: 10MB
- **Formats**: JPG, PNG, WebP, GIF, BMP
- **Recommended**: Under 2MB for best performance

---

## Success Indicators

### Everything Working ✅
- Product page loads
- AR button visible and clickable
- Upload/camera initializes
- Wig appears on image
- Colors change in real-time
- Sliders adjust correctly
- Screenshot downloads
- Add to cart works

### Need Help ⚠️
- Errors in console
- Features not working
- Performance issues
- Unexpected behavior

---

## Contact & Support

### Documentation
- `2D_AR_IMPLEMENTATION.md` - Technical details
- `2D_AR_QUICK_START.md` - User guide
- `IMAGE_UPLOAD_AR_FEATURE.md` - Upload feature
- `2D_AR_TROUBLESHOOTING.md` - This file

### Quick Help
1. Check this guide first
2. Try quick fixes
3. Check console errors
4. Try different approach (upload vs camera)
5. Restart and retry

---

## Status

- **Last Updated**: Now
- **Version**: 1.0
- **Status**: ✅ Working
- **Known Issues**: None (all fixed)

🎃 **Happy AR Try-Ons!**
