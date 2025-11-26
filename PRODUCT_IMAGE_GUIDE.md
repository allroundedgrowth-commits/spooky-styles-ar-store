# Product Image Guide for 2D AR Try-On

## Image Specifications

### 1. Thumbnail Images (Product Grid)
**Purpose:** Display in product catalog, cart, order history

**Dimensions:**
- **Size:** 400x400px (1:1 square ratio)
- **Format:** WebP (with JPG fallback)
- **Quality:** 85%
- **File Size:** < 50KB

**Requirements:**
- Clean white or transparent background
- Product centered in frame
- Good lighting, no shadows
- Sharp focus

**Usage:**
- Product grid cards
- Cart items
- Order history
- Admin dashboard

---

### 2. Detail Images (Product Page)
**Purpose:** Show product details on product page

**Dimensions:**
- **Size:** 800x800px (1:1 square ratio)
- **Format:** WebP (with JPG fallback)
- **Quality:** 90%
- **File Size:** < 150KB

**Requirements:**
- High resolution
- Multiple angles (front, side, back)
- Clean background
- Show texture and details

**Usage:**
- Product detail page gallery
- Zoom functionality
- Social sharing

---

### 3. AR Try-On Images (Most Important!)
**Purpose:** Overlay on user's photo in AR try-on

**Dimensions:**
- **Size:** 1200x1200px (1:1 square ratio)
- **Format:** PNG with transparency
- **Quality:** 95%
- **File Size:** < 300KB

**Critical Requirements:**
- ✅ **Transparent background** (PNG alpha channel)
- ✅ **High resolution** for scaling
- ✅ **Centered product** with padding
- ✅ **No shadows** (AR engine adds them)
- ✅ **Straight-on view** (front-facing)
- ✅ **Consistent lighting**

**For Wigs:**
- Front-facing view
- Hair should be on transparent background
- Include full wig (top to bottom)
- Natural hair flow
- No mannequin head visible

**For Accessories:**
- Front-facing view
- Transparent background
- Proper orientation (as worn)
- Clear edges

---

### 4. Hero/Banner Images (Optional)
**Purpose:** Homepage banners, promotions

**Dimensions:**
- **Desktop:** 1920x600px (16:5 ratio)
- **Mobile:** 800x600px (4:3 ratio)
- **Format:** WebP (with JPG fallback)
- **Quality:** 85%
- **File Size:** < 200KB

---

## Image Naming Convention

```
Format: {category}-{name}-{type}.{ext}

Examples:
- wig-long-black-thumbnail.webp
- wig-long-black-detail.webp
- wig-long-black-ar.png
- accessory-hat-witch-thumbnail.webp
- accessory-hat-witch-ar.png
```

---

## Database Schema (Updated for 2D AR)

### Products Table Fields:

```sql
-- Image URLs (required)
thumbnail_url VARCHAR(500) NOT NULL,     -- 400x400px thumbnail
image_url VARCHAR(500) NOT NULL,         -- 800x800px detail image
ar_image_url VARCHAR(500) NOT NULL,      -- 1200x1200px PNG for AR

-- 3D Model (OPTIONAL - not needed for 2D AR)
model_url VARCHAR(500),                  -- Can be NULL
```

### Migration to Remove 3D Model Requirement:

```sql
-- Make model_url optional
ALTER TABLE products 
ALTER COLUMN model_url DROP NOT NULL;

-- Add AR image URL if not exists
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ar_image_url VARCHAR(500);

-- Update existing products to use image_url as ar_image_url
UPDATE products 
SET ar_image_url = image_url 
WHERE ar_image_url IS NULL;

-- Make ar_image_url required
ALTER TABLE products 
ALTER COLUMN ar_image_url SET NOT NULL;
```

---

## Image Optimization Tools

### Recommended Tools:

1. **Photoshop/GIMP**
   - Remove background
   - Export as PNG with transparency
   - Resize to exact dimensions

2. **Online Tools:**
   - Remove.bg - Background removal
   - TinyPNG - Compression
   - Squoosh.app - Format conversion

3. **Command Line (ImageMagick):**
   ```bash
   # Remove background
   convert input.jpg -fuzz 10% -transparent white output.png
   
   # Resize
   convert input.png -resize 1200x1200 output.png
   
   # Optimize
   pngquant --quality=85-95 input.png -o output.png
   ```

4. **Bulk Processing (Node.js):**
   ```bash
   npm install sharp
   ```

---

## Image Preparation Checklist

### For Each Product:

- [ ] **Thumbnail (400x400px)**
  - [ ] Square crop
  - [ ] Clean background
  - [ ] Centered product
  - [ ] Optimized < 50KB
  - [ ] WebP format

- [ ] **Detail Image (800x800px)**
  - [ ] High quality
  - [ ] Multiple angles
  - [ ] Clean background
  - [ ] Optimized < 150KB
  - [ ] WebP format

- [ ] **AR Image (1200x1200px)**
  - [ ] PNG with transparency
  - [ ] No background
  - [ ] Front-facing view
  - [ ] High resolution
  - [ ] Optimized < 300KB
  - [ ] Centered with padding

---

## Example Product Entry

```json
{
  "name": "Long Black Wig",
  "description": "Beautiful long black wig with natural flow",
  "price": 49.99,
  "category": "wig",
  "theme": "everyday",
  "thumbnail_url": "https://your-cdn.com/wigs/long-black-thumbnail.webp",
  "image_url": "https://your-cdn.com/wigs/long-black-detail.webp",
  "ar_image_url": "https://your-cdn.com/wigs/long-black-ar.png",
  "model_url": null,
  "stock_quantity": 50
}
```

---

## AR Image Best Practices

### DO:
✅ Use transparent PNG
✅ Center the product
✅ Use high resolution (1200x1200px)
✅ Remove all background
✅ Use consistent lighting
✅ Front-facing view
✅ Include full product
✅ Sharp edges

### DON'T:
❌ Use JPG for AR images
❌ Include shadows
❌ Use low resolution
❌ Crop too tight
❌ Include mannequin/model
❌ Use side angles
❌ Leave white background
❌ Compress too much

---

## Testing Your Images

### 1. Transparency Test:
- Open PNG in image editor
- Check alpha channel
- Verify no white edges

### 2. Size Test:
- Check file dimensions
- Verify file size < limits
- Test loading speed

### 3. AR Test:
- Upload to AR try-on
- Check overlay quality
- Verify positioning
- Test scaling

### 4. Quality Test:
- Zoom in 200%
- Check for artifacts
- Verify sharp edges
- Test on mobile

---

## Bulk Image Processing Script

Create `process-images.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processProductImages(inputDir, outputDir) {
  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const name = path.parse(file).name;
    
    // Generate thumbnail (400x400)
    await sharp(inputPath)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, `${name}-thumbnail.webp`));
    
    // Generate detail image (800x800)
    await sharp(inputPath)
      .resize(800, 800, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(path.join(outputDir, `${name}-detail.webp`));
    
    // Generate AR image (1200x1200 PNG)
    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 95 })
      .toFile(path.join(outputDir, `${name}-ar.png`));
    
    console.log(`✅ Processed: ${file}`);
  }
}

// Usage
processProductImages('./input-images', './output-images');
```

---

## Image Storage Options

### 1. AWS S3 (Current Setup)
```
Bucket: amz-s3-hackathon-wigs
Structure:
  /products/
    /wigs/
      wig-name-thumbnail.webp
      wig-name-detail.webp
      wig-name-ar.png
    /accessories/
      accessory-name-thumbnail.webp
      accessory-name-detail.webp
      accessory-name-ar.png
```

### 2. CloudFront CDN
- Faster delivery
- Automatic caching
- Global distribution

### 3. Local Storage (Development)
```
/public/images/
  /products/
    /wigs/
    /accessories/
```

---

## Quick Start: Adding New Product

1. **Prepare Images:**
   - Take/find product photo
   - Remove background (remove.bg)
   - Create 3 versions (thumbnail, detail, AR)
   - Optimize file sizes

2. **Upload to S3:**
   ```bash
   aws s3 cp wig-name-thumbnail.webp s3://amz-s3-hackathon-wigs/products/wigs/
   aws s3 cp wig-name-detail.webp s3://amz-s3-hackathon-wigs/products/wigs/
   aws s3 cp wig-name-ar.png s3://amz-s3-hackathon-wigs/products/wigs/
   ```

3. **Add to Database:**
   ```sql
   INSERT INTO products (
     name, description, price, category, theme,
     thumbnail_url, image_url, ar_image_url,
     stock_quantity
   ) VALUES (
     'Long Black Wig',
     'Beautiful long black wig',
     49.99,
     'wig',
     'everyday',
     'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-thumbnail.webp',
     'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-detail.webp',
     'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-ar.png',
     50
   );
   ```

4. **Test:**
   - View in product catalog
   - Check product detail page
   - Test AR try-on
   - Verify on mobile

---

## Summary

**Key Dimensions:**
- Thumbnail: 400x400px WebP
- Detail: 800x800px WebP
- AR: 1200x1200px PNG (transparent)

**Critical for AR:**
- PNG with transparency
- High resolution
- No background
- Front-facing view
- Centered product

**3D Models:**
- NOT required for 2D AR
- Can be NULL in database
- Optional for future 3D AR

Your 2D AR system only needs the PNG images with transparent backgrounds! 🎃
