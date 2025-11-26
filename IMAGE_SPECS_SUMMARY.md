# Image Specifications - Quick Reference

## ✅ Database Updated

3D models are now **optional**. You only need 2D images for AR try-on!

---

## 📐 Image Dimensions

### Thumbnail (Product Grid)
```
Size: 400 x 400 pixels
Format: WebP
Quality: 85%
Max File Size: 50KB
Background: White or transparent
```

### Detail Image (Product Page)
```
Size: 800 x 800 pixels
Format: WebP
Quality: 90%
Max File Size: 150KB
Background: White or clean
```

### AR Overlay (Try-On)
```
Size: 1200 x 1200 pixels
Format: PNG (with alpha channel)
Quality: 95%
Max File Size: 300KB
Background: TRANSPARENT (required!)
```

---

## 🎯 Critical for AR Images

**Must Have:**
- ✅ PNG format (not JPG)
- ✅ Transparent background
- ✅ 1200x1200px size
- ✅ Front-facing view
- ✅ Centered product
- ✅ No shadows

**Don't Include:**
- ❌ White background
- ❌ Mannequin/model
- ❌ Side angles
- ❌ Shadows
- ❌ Low resolution

---

## 📊 Database Fields

```sql
thumbnail_url   VARCHAR(500) NOT NULL  -- 400x400 WebP
image_url       VARCHAR(500) NOT NULL  -- 800x800 WebP
ar_image_url    VARCHAR(500) NOT NULL  -- 1200x1200 PNG
model_url       VARCHAR(500)           -- Optional (can be NULL)
```

---

## 🛠️ Quick Tools

**Remove Background:**
- Remove.bg (online, free)
- Photoshop
- GIMP (free)

**Resize & Optimize:**
- TinyPNG.com
- Squoosh.app
- ImageMagick (command line)

**Bulk Processing:**
- Sharp (Node.js)
- ImageMagick scripts

---

## 📝 Example Product

```json
{
  "name": "Long Black Wig",
  "thumbnail_url": "https://cdn.com/wig-thumb.webp",
  "image_url": "https://cdn.com/wig-detail.webp",
  "ar_image_url": "https://cdn.com/wig-ar.png",
  "model_url": null
}
```

---

## ✅ Testing Checklist

- [ ] Thumbnail displays in product grid
- [ ] Detail image shows on product page
- [ ] AR image has transparent background
- [ ] AR overlay works correctly
- [ ] No white edges on AR image
- [ ] Images load quickly
- [ ] Works on mobile

---

## 📚 Full Documentation

See `PRODUCT_IMAGE_GUIDE.md` for complete details.
See `PRODUCT_EDITING_QUICK_START.md` for editing instructions.

---

**Bottom Line:** You need 3 images per product (400px, 800px, 1200px). The 1200px AR image must be PNG with transparent background. 3D models are optional! 🎃
