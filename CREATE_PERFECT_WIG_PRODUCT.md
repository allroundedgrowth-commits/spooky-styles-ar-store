# Creating a Perfect Wig Product for 2D AR Try-On

## The Problem
Your wig images may not be working well because:
1. **No transparency** - Background isn't removed (PNG with alpha channel required)
2. **Wrong dimensions** - Image aspect ratio doesn't match wig shape
3. **Poor quality** - Low resolution or compression artifacts
4. **Incorrect positioning** - Wig not centered or cropped properly

## Image Requirements

### 1. AR Image (ar_image_url) - MOST IMPORTANT
This is the image that overlays on the user's head in AR mode.

**Requirements:**
- **Format:** PNG with transparent background (alpha channel)
- **Dimensions:** 1200x1200px minimum (square)
- **Content:** Just the wig, no model, no background
- **Positioning:** Wig centered, hairline at bottom 1/3 of image
- **Quality:** High resolution, no compression artifacts
- **Transparency:** Clean edges, no white/gray halos

**Example Layout:**
```
┌─────────────────┐
│                 │  ← Top of image (empty space for wig volume)
│   ████████████  │  ← Top of wig (hair volume)
│  ██████████████ │
│ ████████████████│
│ ████████████████│  ← Middle of wig
│ ████████████████│
│  ██████████████ │
│   ████████████  │  ← Bottom of wig (hairline)
│                 │  ← Bottom of image (minimal space)
└─────────────────┘
```

### 2. Product Image (image_url)
Detail image for product page.

**Requirements:**
- **Format:** JPG or PNG
- **Dimensions:** 800x800px
- **Content:** Wig on model or mannequin (can have background)
- **Purpose:** Show customers what the wig looks like

### 3. Thumbnail (thumbnail_url)
Grid thumbnail for product listings.

**Requirements:**
- **Format:** JPG or PNG
- **Dimensions:** 400x400px
- **Content:** Same as product image, smaller size
- **Purpose:** Fast loading in product grids

## How to Create Proper AR Images

### Option 1: Use AI Background Removal (Easiest)
1. Take/find a photo of the wig on a mannequin or model
2. Use one of these free tools:
   - **remove.bg** - https://www.remove.bg/ (best quality)
   - **Adobe Express** - https://www.adobe.com/express/feature/image/remove-background
   - **Canva** - Background remover tool
3. Download as PNG with transparency
4. Crop to square (1200x1200px)
5. Position wig so hairline is at bottom 1/3

### Option 2: Use Photoshop/GIMP (Professional)
1. Open wig image in Photoshop or GIMP
2. Use Magic Wand or Select Subject to select wig
3. Invert selection and delete background
4. Refine edges to remove halos
5. Save as PNG with transparency
6. Resize to 1200x1200px

### Option 3: Use Free Stock Images
Many wig manufacturers provide transparent PNG images:
- Search "wig PNG transparent" on Google Images
- Filter by "Transparent" in Tools
- Download high-resolution images
- Verify transparency by opening in image editor

## Testing Your Images

### Quick Test
1. Open your PNG in an image editor
2. Add a bright colored background layer
3. If you see white/gray edges around the wig = BAD
4. If wig edges blend perfectly = GOOD

### Transparency Checklist
- [ ] File format is PNG (not JPG)
- [ ] File has alpha channel (transparency)
- [ ] Background is fully transparent (0% opacity)
- [ ] No white or gray halos around edges
- [ ] Wig is centered in frame
- [ ] Hairline is positioned at bottom 1/3
- [ ] Image is at least 1200x1200px
- [ ] File size is reasonable (< 2MB)

## Example Product SQL

Here's a properly configured wig product:

```sql
INSERT INTO products (
  name,
  description,
  price,
  promotional_price,
  category,
  theme,
  model_url,
  thumbnail_url,
  image_url,
  ar_image_url,
  stock_quantity,
  is_accessory
) VALUES (
  'Midnight Purple Cascade',
  'Long flowing purple wig with natural waves, perfect for any occasion',
  34.99,
  29.99,
  'wigs',
  'witch',
  NULL, -- 3D model not required for 2D AR
  'https://your-cdn.com/wigs/purple-cascade-thumb.jpg',
  'https://your-cdn.com/wigs/purple-cascade-detail.jpg',
  'https://your-cdn.com/wigs/purple-cascade-ar-transparent.png', -- MUST BE TRANSPARENT PNG
  50,
  false
) RETURNING id;
```

## Common Issues & Solutions

### Issue 1: Wig appears with white box around it
**Cause:** Image has white background instead of transparency
**Solution:** Re-export as PNG with alpha channel, remove background

### Issue 2: Wig doesn't fit head properly
**Cause:** Image not centered or wrong aspect ratio
**Solution:** Crop to square, center wig, position hairline at bottom 1/3

### Issue 3: Wig looks pixelated or blurry
**Cause:** Image resolution too low
**Solution:** Use minimum 1200x1200px, avoid over-compression

### Issue 4: Wig edges look jagged or have halos
**Cause:** Poor background removal or compression
**Solution:** Use better removal tool, refine edges, save as PNG-24

### Issue 5: Wig is too small or too large
**Cause:** Auto-scaling not working due to poor image composition
**Solution:** Ensure wig fills 60-80% of image width

## Recommended Free Tools

1. **Background Removal:**
   - remove.bg (best quality, 1 free/month)
   - Adobe Express (free with account)
   - Photopea (free Photoshop alternative)

2. **Image Editing:**
   - GIMP (free, powerful)
   - Photopea (browser-based)
   - Paint.NET (Windows, simple)

3. **Image Optimization:**
   - TinyPNG (compress without quality loss)
   - Squoosh (Google's image optimizer)

## Quick Start: Create Your First Perfect Wig

1. **Find a wig image** (Google "purple wig PNG transparent")
2. **Download high-res PNG** (at least 1000x1000px)
3. **Open in image editor** and verify transparency
4. **Crop to square** (1200x1200px)
5. **Position wig** so hairline is at bottom 1/3
6. **Save as PNG** with transparency
7. **Upload to your CDN/S3**
8. **Add product to database** with ar_image_url pointing to your PNG
9. **Test in AR try-on** page

## Need Help?

If you're still having issues:
1. Share your wig image URL
2. Describe what you see vs what you expect
3. Check browser console for errors
4. Verify image loads correctly (right-click > Open in new tab)

The 2D AR engine is working perfectly - it just needs properly prepared transparent PNG images!
