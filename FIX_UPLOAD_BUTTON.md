# Fix Upload Button - Troubleshooting Guide

## Issue: Upload Button Not Working

The upload button in the admin dashboard isn't working. Let's fix it!

---

## Quick Diagnosis

### Step 1: Check Browser Console

1. Open admin dashboard: http://localhost:3001/admin
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Click "Add New Product"
5. Try to upload an image
6. **Look for error messages in console**

### Common Errors:

**"401 Unauthorized"**
- You're not logged in as admin
- Token expired
- Solution: Re-login to admin

**"403 Forbidden"**
- Not admin user
- Solution: Use admin account

**"Network Error"**
- Backend not running
- Solution: Start backend

**"AWS credentials not configured"**
- AWS keys missing
- Solution: Check `.env` file

---

## Solution 1: Simplest Workaround (Use URLs)

### Instead of uploading, paste URLs directly:

1. Upload images to S3 manually (AWS CLI or console)
2. Get the URLs
3. Paste URLs into the form fields
4. Save product

**Example URLs:**
```
Thumbnail: https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-thumb.webp
Detail: https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-detail.webp
AR: https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-ar.png
```

---

## Solution 2: Upload via AWS CLI

### Upload images directly to S3:

```bash
# Install AWS CLI first
# Configure with your credentials

# Upload images
aws s3 cp thumbnail.webp s3://amz-s3-hackathon-wigs/products/wigs/wig-name-thumb.webp --acl public-read
aws s3 cp detail.webp s3://amz-s3-hackathon-wigs/products/wigs/wig-name-detail.webp --acl public-read
aws s3 cp ar.png s3://amz-s3-hackathon-wigs/products/wigs/wig-name-ar.png --acl public-read

# Get URLs
echo "https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-thumb.webp"
echo "https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-detail.webp"
echo "https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-ar.png"
```

Then paste these URLs into the admin form.

---

## Solution 3: Fix Upload Functionality

### Check Backend is Running:

```bash
# Test backend
curl http://localhost:5000/api/products

# Should return products list
```

### Check AWS Credentials:

**File: `.env`**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA2SBNPWS7SSPIQ6OW
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=amz-s3-hackathon-wigs
```

### Test Upload Endpoint:

```bash
# Get admin token first (login)
# Then test upload
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## Solution 4: Update Database Directly

### If you already have images uploaded:

```sql
-- Update product with image URLs
UPDATE products 
SET 
  thumbnail_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-thumb.webp',
  image_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-detail.webp',
  ar_image_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-ar.png',
  model_url = NULL
WHERE name = 'Product Name';
```

---

## Missing Fields in Form

### The form is missing two image fields:

Currently has:
- ✅ Thumbnail upload
- ❌ Detail image upload (MISSING)
- ❌ AR image upload (MISSING)
- ✅ 3D model upload (should be optional)

### Temporary Fix:

Use the same image for all three:

1. Upload one image via thumbnail field
2. Copy the URL
3. Manually update database with same URL for all three fields

```sql
UPDATE products 
SET 
  thumbnail_url = 'URL_HERE',
  image_url = 'URL_HERE',      -- Same URL
  ar_image_url = 'URL_HERE'    -- Same URL
WHERE id = 'product-id';
```

---

## Recommended Approach

### For Now (Quick):

1. **Prepare your images** (400x400, 800x800, 1200x1200)
2. **Upload to S3** via AWS CLI or console
3. **Get the URLs**
4. **Paste URLs** into admin form
5. **Save product**

### For Later (Proper Fix):

1. Update ProductForm component
2. Add three separate upload buttons
3. Make 3D model optional
4. Test upload functionality

---

## Step-by-Step: Upload Images Now

### 1. Prepare Images

```bash
# You need 3 images per product:
wig-name-thumb.webp    (400x400)
wig-name-detail.webp   (800x800)
wig-name-ar.png        (1200x1200, transparent)
```

### 2. Upload to S3

**Option A: AWS Console**
1. Go to https://s3.console.aws.amazon.com
2. Open bucket: `amz-s3-hackathon-wigs`
3. Navigate to `products/wigs/`
4. Click "Upload"
5. Drag files
6. Set permissions to "public-read"
7. Upload

**Option B: AWS CLI**
```bash
aws s3 cp wig-name-thumb.webp s3://amz-s3-hackathon-wigs/products/wigs/ --acl public-read
aws s3 cp wig-name-detail.webp s3://amz-s3-hackathon-wigs/products/wigs/ --acl public-read
aws s3 cp wig-name-ar.png s3://amz-s3-hackathon-wigs/products/wigs/ --acl public-read
```

### 3. Get URLs

```
https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-thumb.webp
https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-detail.webp
https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/wig-name-ar.png
```

### 4. Update Product

**Option A: Admin Dashboard**
1. Go to admin
2. Edit product
3. Paste thumbnail URL
4. Save

**Option B: Database**
```sql
UPDATE products 
SET 
  thumbnail_url = 'URL1',
  image_url = 'URL2',
  ar_image_url = 'URL3'
WHERE id = 'product-id';
```

---

## Check Upload Button Error

### Open browser console and look for:

**Error: "Failed to upload image"**
- Check AWS credentials
- Check S3 bucket exists
- Check backend logs

**Error: "401 Unauthorized"**
- Re-login to admin
- Check admin token

**Error: "Network Error"**
- Start backend server
- Check CORS settings

**No error, but nothing happens:**
- Check file size (< 5MB)
- Check file type (JPG, PNG, WebP)
- Try different browser

---

## Summary

**Quick Fix (Now):**
1. Upload images to S3 manually
2. Paste URLs into admin form
3. Save product

**Proper Fix (Later):**
1. Update ProductForm with 3 image uploads
2. Make 3D model optional
3. Fix upload button issues

**For now, use manual URL entry - it works!** 🎃
