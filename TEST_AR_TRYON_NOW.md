# Test AR Try-On - Quick Guide

## What Was Fixed

1. **ARTryOn.tsx** - Now uses high-quality AR images (`ar_image_url`) instead of just thumbnails
2. **Simple2DARTryOn.tsx** - Hair flattening feature is now enabled

## How to Test

### Test 1: Basic AR Try-On (ARTryOn.tsx)
```bash
# Start the app
npm run dev

# Navigate to:
http://localhost:3000/products

# Click any product → "Try On" button
# Or directly: http://localhost:3000/ar-tryon/[product-id]
```

**Expected:**
- AR view opens
- High-quality wig image loads (not thumbnail)
- Camera or upload photo options work
- Wig overlays on face

---

### Test 2: Smart Hair Adjustment (Simple2DARTryOn.tsx)
```bash
# Navigate to:
http://localhost:3000/ar-tryon/[product-id]
# or
http://localhost:3000/ar-tryon
```

**Expected:**
1. **Initialization:**
   - Console shows: "Hair flattening modules initialized successfully"
   - No errors about MediaPipe models

2. **Upload Photo with Hair:**
   - Click "Upload Your Photo"
   - Choose image with visible hair
   - Wait for processing

3. **Hair Detection:**
   - Volume Score Indicator appears (top-right)
   - Shows score 0-100 and category (Low/Medium/High/Very High)
   - If score > 40: Auto-flattening message appears

4. **Manual Controls:**
   - Adjustment Mode Toggle visible
   - Can switch: Normal → Flattened → Enhanced
   - "Compare Before/After" button works

5. **Performance:**
   - FPS stays above 15
   - No lag or freezing
   - Smooth wig overlay

---

## Console Checks

### Good Signs ✅
```
✅ MediaPipe Face Mesh initialized
✅ 2D AR Engine initialized
✅ Hair flattening modules initialized successfully
✅ Wig image loaded: [url]
```

### Bad Signs ❌
```
❌ Failed to initialize hair flattening
❌ Failed to load wig image
❌ Camera access denied
❌ Model load failed
```

---

## Quick Troubleshooting

### Issue: "Hair flattening not working"
**Check:**
1. Console for initialization errors
2. Network tab for MediaPipe model downloads
3. Browser console for CORS errors

**Solution:**
- Ensure internet connection (MediaPipe loads from CDN)
- Clear browser cache
- Try different browser

---

### Issue: "Camera not working on mobile"
**Check:**
- HTTPS requirement on mobile
- Camera permissions

**Solution:**
- Use "Upload Photo" option instead
- Or ensure HTTPS connection

---

### Issue: "Wig not showing"
**Check:**
1. Product has `ar_image_url` or `image_url`
2. Image URL is accessible
3. CORS headers allow loading

**Solution:**
- Check product data in database
- Verify image URLs are valid
- Check network tab for 404 errors

---

## Test Scenarios

### Scenario 1: User with Long Hair
1. Upload photo with long, voluminous hair
2. **Expected:** Volume score 60-80, auto-flattening applied
3. **Verify:** Hair adjustment message shows
4. **Test:** Switch to "Normal" mode - see difference

### Scenario 2: User with Short Hair
1. Upload photo with short hair
2. **Expected:** Volume score 20-40, no auto-flattening
3. **Verify:** Can manually enable "Flattened" mode
4. **Test:** Compare before/after

### Scenario 3: Bald/No Hair
1. Upload photo with no visible hair
2. **Expected:** Volume score 0-20, "Low" category
3. **Verify:** Wig overlays normally
4. **Test:** All modes work the same

### Scenario 4: Camera Mode
1. Click "Use Camera"
2. **Expected:** Real-time face tracking
3. **Verify:** MediaPipe Face Mesh active indicator
4. **Test:** Move head - wig follows

---

## Performance Benchmarks

### Target Metrics
- **FPS:** 15+ (with hair flattening)
- **Segmentation Time:** < 67ms per frame
- **Initialization Time:** < 3 seconds
- **Memory Usage:** < 200MB

### How to Check
```javascript
// Open browser console
// Check performance metrics in hairProcessingState
```

---

## Success Criteria

✅ AR try-on opens without errors
✅ High-quality images load
✅ Hair flattening initializes
✅ Volume score displays correctly
✅ Auto-flattening works (score > 40)
✅ Manual mode switching works
✅ Comparison view works
✅ Screenshot capture works
✅ Performance is smooth (15+ FPS)

---

## Files Changed

1. `frontend/src/pages/ARTryOn.tsx` - Image URL fallback
2. `frontend/src/pages/Simple2DARTryOn.tsx` - Enable hair flattening

**No backend changes needed** - All fixes are frontend-only.

---

## Next Steps After Testing

If everything works:
1. ✅ Mark AR try-on as fully functional
2. ✅ Update user documentation
3. ✅ Consider adding analytics tracking
4. ✅ Gather user feedback

If issues found:
1. Check console errors
2. Review `SIMPLE2DAR_HAIR_FLATTENING_FIX.md`
3. Verify MediaPipe dependencies
4. Test in different browsers
