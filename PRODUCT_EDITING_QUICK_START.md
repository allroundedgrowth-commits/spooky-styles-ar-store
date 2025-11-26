# Product Editing Quick Start Guide

## ✅ Database Updated for 2D AR

The database has been updated to support 2D AR without requiring 3D models.

---

## Image Requirements Summary

### Quick Reference:

| Image Type | Size | Format | Required | Purpose |
|------------|------|--------|----------|---------|
| **Thumbnail** | 400x400px | WebP | ✅ Yes | Product grid, cart |
| **Detail** | 800x800px | WebP | ✅ Yes | Product page |
| **AR Overlay** | 1200x1200px | PNG | ✅ Yes | AR try-on |
| **3D Model** | N/A | GLB/GLTF | ❌ No | Optional (future) |

---

## Database Schema

### Current Product Fields:

```sql
-- Required Image Fields
thumbnail_url VARCHAR(500) NOT NULL  -- 400x400px WebP
image_url VARCHAR(500) NOT NULL      -- 800x800px WebP  
ar_image_url VARCHAR(500) NOT NULL   -- 1200x1200px PNG (transparent)

-- Optional 3D Model
model_url VARCHAR(500)               -- Can be NULL
```

---

## Ideal Image Dimensions

### 1. Thumbnail (Product Grid)
```
Size: 400x400px (1:1 ratio)
Format: WebP
Quality: 85%
Max Size: 50KB
Background: White or transparent
```

**Used in:**
- Product catalog grid
- Cart items
- Order history
- Search results

---

### 2. Detail Image (Product Page)
```
Size: 800x800px (1:1 ratio)
Format: WebP
Quality: 90%
Max Size: 150KB
Background: White or clean
```

**Used in:**
- Product detail page
- Image gallery
- Zoom view
- Social sharing

---

### 3. AR Overlay Image (Most Important!)
```
Size: 1200x1200px (1:1 ratio)
Format: PNG with alpha channel
Quality: 95%
Max Size: 300KB
Background: TRANSPARENT (critical!)
```

**Critical Requirements:**
- ✅ **Must be PNG** (not JPG)
- ✅ **Must have transparent background**
- ✅ **Front-facing view only**
- ✅ **Centered with padding**
- ✅ **No shadows** (AR adds them)
- ✅ **High resolution** for scaling

**Used in:**
- AR try-on overlay
- Virtual fitting
- Screenshot capture

---

## How to Edit Products

### Option 1: Direct Database Update

```sql
-- Update a single product
UPDATE products 
SET 
  name = 'New Product Name',
  description = 'Updated description',
  price = 49.99,
  thumbnail_url = 'https://your-cdn.com/thumb.webp',
  image_url = 'https://your-cdn.com/detail.webp',
  ar_image_url = 'https://your-cdn.com/ar.png',
  model_url = NULL  -- Optional, can be NULL
WHERE id = 'product-uuid-here';
```

### Option 2: Admin Dashboard

1. Go to http://localhost:3001/admin
2. Login with admin credentials
3. Click "Edit" on any product
4. Update fields
5. Save changes

### Option 3: Bulk Import Script

Create `update-products.sql`:
```sql
-- Update multiple products
UPDATE products SET 
  image_url = thumbnail_url,
  ar_image_url = thumbnail_url
WHERE image_url IS NULL;
```

---

## Image Preparation Workflow

### Step 1: Prepare Source Image
- Take/find high-quality product photo
- Minimum 1200x1200px resolution
- Good lighting, clear focus

### Step 2: Remove Background
**Tools:**
- Remove.bg (online, free)
- Photoshop (Select > Subject > Delete background)
- GIMP (Free alternative)

### Step 3: Create 3 Versions

**A. AR Image (1200x1200px PNG):**
```bash
# Using ImageMagick
convert source.png -resize 1200x1200 -background none -gravity center -extent 1200x1200 ar-image.png
```

**B. Detail Image (800x800px WebP):**
```bash
convert source.png -resize 800x800 -quality 90 detail-image.webp
```

**C. Thumbnail (400x400px WebP):**
```bash
convert source.png -resize 400x400 -quality 85 thumbnail.webp
```

### Step 4: Upload to S3
```bash
aws s3 cp thumbnail.webp s3://amz-s3-hackathon-wigs/products/wigs/
aws s3 cp detail-image.webp s3://amz-s3-hackathon-wigs/products/wigs/
aws s3 cp ar-image.png s3://amz-s3-hackathon-wigs/products/wigs/
```

### Step 5: Update Database
```sql
UPDATE products 
SET 
  thumbnail_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/thumbnail.webp',
  image_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/detail-image.webp',
  ar_image_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/ar-image.png'
WHERE name = 'Product Name';
```

---

## Testing Your Images

### 1. Test Thumbnail
- Go to http://localhost:3001/products
- Check product displays correctly
- Verify image loads fast
- Check on mobile

### 2. Test Detail Image
- Click product
- Check detail page
- Verify image quality
- Test zoom (if implemented)

### 3. Test AR Image
- Click "Virtual Try-On"
- Upload a photo
- Verify wig overlays correctly
- Check transparency works
- Test scaling and positioning
- Verify no white edges

---

## Common Issues & Solutions

### Issue: White edges on AR image
**Solution:** 
- Re-export PNG with transparency
- Use "Save for Web" in Photoshop
- Check alpha channel

### Issue: AR image too small/large
**Solution:**
- Ensure 1200x1200px size
- Center product with padding
- Leave 10-15% margin around edges

### Issue: Image file too large
**Solution:**
- Compress with TinyPNG
- Reduce quality slightly
- Use WebP format (except AR)

### Issue: AR image has shadows
**Solution:**
- Remove shadows in editing
- Use clean background removal
- AR engine adds shadows automatically

---

## Bulk Update Script

Create `bulk-update-images.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db'
});

async function updateProductImages() {
  const products = [
    {
      id: 'product-uuid-1',
      thumbnail: 'https://cdn.com/thumb1.webp',
      detail: 'https://cdn.com/detail1.webp',
      ar: 'https://cdn.com/ar1.png'
    },
    // Add more products...
  ];

  for (const product of products) {
    await pool.query(
      `UPDATE products 
       SET thumbnail_url = $1, image_url = $2, ar_image_url = $3 
       WHERE id = $4`,
      [product.thumbnail, product.detail, product.ar, product.id]
    );
    console.log(`✅ Updated: ${product.id}`);
  }
  
  await pool.end();
}

updateProductImages();
```

---

## Quick Commands

### Check current products:
```bash
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "SELECT id, name, thumbnail_url, image_url, ar_image_url FROM products LIMIT 5;"
```

### Update single product:
```bash
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "UPDATE products SET ar_image_url = 'new-url.png' WHERE name = 'Product Name';"
```

### Check image URLs:
```bash
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "SELECT name, ar_image_url FROM products WHERE ar_image_url LIKE '%thumbnail%';"
```

---

## Summary

**Key Points:**
1. ✅ 3D models are now **optional** (model_url can be NULL)
2. ✅ AR uses **PNG images** with transparent backgrounds
3. ✅ Three image sizes needed: 400px, 800px, 1200px
4. ✅ AR image must be **1200x1200px PNG** with transparency
5. ✅ Use WebP for thumbnails and detail images
6. ✅ Test AR after updating images

**Image Checklist:**
- [ ] Thumbnail: 400x400px WebP
- [ ] Detail: 800x800px WebP
- [ ] AR: 1200x1200px PNG (transparent)
- [ ] All uploaded to S3/CDN
- [ ] Database updated with URLs
- [ ] Tested in product catalog
- [ ] Tested in AR try-on

You're ready to edit products! 🎃
