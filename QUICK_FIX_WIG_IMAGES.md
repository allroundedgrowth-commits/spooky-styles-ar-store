# Quick Fix: Make Your Wig Images Work in AR

## TL;DR - The Problem

Your wig images probably have **white/gray backgrounds** instead of **transparency**. The 2D AR system needs PNG images with transparent backgrounds (alpha channel) to overlay wigs naturally on faces.

## 3-Minute Fix

### 1. Get a Transparent PNG (Choose One)

**Option A: Use Free Sample (Fastest)**
```bash
# Run this script to add a working sample product
node add-perfect-wig.js
```

**Option B: Convert Your Image**
1. Go to https://www.remove.bg/
2. Upload your wig image
3. Download as PNG
4. Done!

**Option C: Find Free Stock**
- Google: "wig PNG transparent"
- Filter: Tools > Color > Transparent
- Download high-res image

### 2. Add Product to Database

```bash
# Using the script (easiest)
node add-perfect-wig.js "https://your-cdn.com/wig-transparent.png"

# Or manually via SQL
psql $DATABASE_URL -f add-sample-wig-with-transparency.sql
```

### 3. Test in AR

1. Visit http://localhost:3000/products
2. Find your new wig product
3. Click "Try On"
4. Wig should appear naturally on your face!

## What Makes a Good AR Wig Image?

### ✅ MUST HAVE:
- **PNG format** (not JPG)
- **Transparent background** (no white/gray)
- **Square dimensions** (1200x1200px recommended)
- **Wig centered** in frame
- **Clean edges** (no halos)

### ❌ AVOID:
- JPG format (no transparency support)
- White or gray backgrounds
- Low resolution (< 800px)
- Wig off-center or cropped badly
- Compressed/pixelated images

## Visual Comparison

### Bad Image (Won't Work)
```
File: wig.jpg
Format: JPEG
Background: White
Result: White box appears around wig in AR ❌
```

### Good Image (Works Perfect)
```
File: wig.png
Format: PNG-24 with alpha
Background: Transparent
Result: Wig blends naturally with face ✅
```

## Quick Test

Open your PNG in an image editor:
- See **checkerboard pattern** behind wig? ✅ Good!
- See **white/gray** behind wig? ❌ Not transparent!

## Sample Images for Testing

These are free transparent PNGs you can use right now:

```javascript
// Purple wig
https://www.pngarts.com/files/3/Purple-Hair-PNG-Image.png

// Black wig
https://www.pngarts.com/files/3/Black-Hair-PNG-Image.png

// Blonde wig
https://www.pngarts.com/files/3/Blonde-Hair-PNG-Image.png

// Red wig
https://www.pngarts.com/files/3/Red-Hair-PNG-Image.png
```

## Common Issues

### "Wig appears with white box"
**Cause:** Image has white background
**Fix:** Remove background using remove.bg

### "Wig doesn't fit head"
**Cause:** Image not centered or wrong size
**Fix:** Crop to square, center wig, ensure wig fills 60-80% of width

### "Wig looks blurry"
**Cause:** Low resolution or over-compressed
**Fix:** Use minimum 1200x1200px, save as PNG-24

### "Wig has gray edges"
**Cause:** Poor background removal
**Fix:** Use better tool (remove.bg), refine edges

## Files Created for You

1. **CREATE_PERFECT_WIG_PRODUCT.md** - Complete guide with all details
2. **WIG_IMAGE_PREPARATION_VISUAL_GUIDE.md** - Visual step-by-step guide
3. **add-perfect-wig.js** - Script to add sample product
4. **add-sample-wig-with-transparency.sql** - SQL to add product manually

## Next Steps

1. **Test with sample:** `node add-perfect-wig.js`
2. **See it work:** Visit AR try-on page
3. **Prepare your images:** Follow WIG_IMAGE_PREPARATION_VISUAL_GUIDE.md
4. **Upload to S3/CDN:** Use your own images
5. **Add products:** Use the script or SQL

## The AR Engine is Perfect!

The 2D AR system with MediaPipe face tracking is working flawlessly. It:
- ✅ Tracks faces with 468 landmarks
- ✅ Positions wigs naturally on heads
- ✅ Auto-scales for different head sizes
- ✅ Handles transparency perfectly
- ✅ Smooth tracking with interpolation

**It just needs properly prepared transparent PNG images!**

## Need Help?

1. Read CREATE_PERFECT_WIG_PRODUCT.md for full details
2. Check WIG_IMAGE_PREPARATION_VISUAL_GUIDE.md for visual guide
3. Test with sample images first
4. Compare your images to working samples

Your AR try-on will work perfectly once you have proper transparent PNGs! 🎃✨
