# How to Upload Product Images from Your Computer

## ✅ Upload Feature Already Implemented!

Your admin dashboard already has image upload functionality built-in.

---

## 🎯 Quick Start: Upload Images via Admin Dashboard

### Step 1: Access Admin Dashboard
```
1. Go to: http://localhost:3001/admin
2. Login with admin credentials
3. Click "Add New Product" or "Edit" on existing product
```

### Step 2: Upload Images
The product form has upload buttons for:
- **Thumbnail Image** (400x400px)
- **Detail Image** (800x800px) 
- **AR Image** (1200x1200px PNG)
- **3D Model** (optional)

### Step 3: Click Upload Button
1. Click the upload button for the image type
2. Select file from your computer
3. Wait for upload to complete
4. URL automatically fills in the form
5. Save product

---

## 📋 Supported File Types

### Images:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ✅ GIF (.gif)

### File Size Limits:
- Images: Max 5MB
- 3D Models: Max 50MB

---

## 🖼️ Image Requirements

### Before Uploading:

**Thumbnail (400x400px):**
- Square (1:1 ratio)
- WebP or JPG format
- < 50KB file size
- Clean background

**Detail Image (800x800px):**
- Square (1:1 ratio)
- WebP or JPG format
- < 150KB file size
- High quality

**AR Image (1200x1200px):**
- Square (1:1 ratio)
- PNG with transparency
- < 300KB file size
- No background

---

## 🚀 Upload Methods

### Method 1: Admin Dashboard (Easiest)

**Steps:**
1. Go to http://localhost:3001/admin
2. Click "Add New Product"
3. Fill in product details
4. Click "Upload Image" button
5. Select file from computer
6. Wait for upload
7. Save product

**Pros:**
- ✅ Easy to use
- ✅ Visual interface
- ✅ Automatic validation
- ✅ Instant preview

---

### Method 2: AWS CLI (Bulk Upload)

**For uploading many images at once:**

```bash
# Install AWS CLI first
# Then configure with your credentials

# Upload single file
aws s3 cp image.webp s3://amz-s3-hackathon-wigs/products/wigs/

# Upload entire folder
aws s3 cp ./images/ s3://amz-s3-hackathon-wigs/products/wigs/ --recursive

# Upload with public-read ACL
aws s3 cp image.webp s3://amz-s3-hackathon-wigs/products/wigs/ --acl public-read
```

**Then update database with URLs:**
```sql
UPDATE products 
SET thumbnail_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/image.webp'
WHERE id = 'product-id';
```

---

### Method 3: Direct S3 Upload (Advanced)

**Using AWS S3 Console:**
1. Go to https://s3.console.aws.amazon.com
2. Open bucket: `amz-s3-hackathon-wigs`
3. Navigate to `products/wigs/` or `products/accessories/`
4. Click "Upload"
5. Drag and drop files
6. Click "Upload"
7. Copy URLs and update database

---

## 📁 Folder Structure on S3

```
amz-s3-hackathon-wigs/
├── products/
│   ├── wigs/
│   │   ├── wig-name-thumbnail.webp
│   │   ├── wig-name-detail.webp
│   │   ├── wig-name-ar.png
│   │   └── wig-name-model.glb (optional)
│   └── accessories/
│       ├── accessory-name-thumbnail.webp
│       ├── accessory-name-detail.webp
│       └── accessory-name-ar.png
└── inspirations/
    └── inspiration-images.webp
```

---

## 🔧 Troubleshooting

### Upload Button Not Working?

**Check:**
1. Are you logged in as admin?
2. Is backend running? (http://localhost:5000)
3. Are AWS credentials configured in `.env`?
4. Check browser console for errors (F12)

### File Too Large?

**Solutions:**
- Compress image with TinyPNG.com
- Resize to exact dimensions
- Convert to WebP format
- Reduce quality slightly

### Upload Fails?

**Check:**
1. File type is supported (JPG, PNG, WebP, GIF)
2. File size under 5MB
3. AWS credentials are correct
4. S3 bucket exists and is accessible

### Image Doesn't Display?

**Check:**
1. URL is correct in database
2. S3 bucket permissions allow public read
3. Image actually uploaded to S3
4. Clear browser cache (Ctrl+F5)

---

## 💡 Best Practices

### Naming Convention:
```
Format: {category}-{product-name}-{type}.{ext}

Examples:
wig-long-black-thumbnail.webp
wig-long-black-detail.webp
wig-long-black-ar.png
accessory-witch-hat-thumbnail.webp
```

### Organize by Category:
```
/products/wigs/          - All wig images
/products/accessories/   - All accessory images
/products/hats/          - All hat images
```

### Use Descriptive Names:
- ✅ `wig-curly-red-thumbnail.webp`
- ❌ `IMG_1234.jpg`

---

## 🎨 Image Preparation Workflow

### Complete Workflow:

1. **Take/Find Photo**
   - High quality
   - Good lighting
   - Clear focus

2. **Remove Background** (for AR image)
   - Use Remove.bg
   - Or Photoshop
   - Save as PNG

3. **Resize to 3 Sizes**
   - 400x400px (thumbnail)
   - 800x800px (detail)
   - 1200x1200px (AR)

4. **Optimize File Sizes**
   - Compress with TinyPNG
   - Convert to WebP (except AR)
   - Check file sizes

5. **Upload via Admin Dashboard**
   - Go to admin
   - Add/edit product
   - Click upload buttons
   - Select files
   - Save

6. **Test**
   - View in product catalog
   - Check product detail page
   - Test AR try-on
   - Verify on mobile

---

## 📊 Upload Status Indicators

### In Admin Dashboard:

**Uploading:**
```
[=====>    ] Uploading... 45%
```

**Success:**
```
✅ Image uploaded successfully!
URL: https://s3.amazonaws.com/...
```

**Error:**
```
❌ Upload failed: File too large
```

---

## 🔐 AWS Credentials Setup

### If Upload Fails Due to AWS:

**Check `.env` file:**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=amz-s3-hackathon-wigs
```

**Your current credentials:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA2SBNPWS7SSPIQ6OW
AWS_SECRET_ACCESS_KEY=cbG/sYma49hJivSuS6Of3Pi2aKRVR81gOE+QSWbv
S3_BUCKET_NAME=amz-s3-hackathon-wigs
```

---

## 🎯 Quick Upload Checklist

### Before Uploading:
- [ ] Image is square (1:1 ratio)
- [ ] Correct dimensions (400/800/1200px)
- [ ] File size under limit
- [ ] AR image has transparent background
- [ ] File type is supported
- [ ] Image is optimized

### During Upload:
- [ ] Logged into admin dashboard
- [ ] Backend server running
- [ ] AWS credentials configured
- [ ] Internet connection stable

### After Upload:
- [ ] URL appears in form
- [ ] Save product
- [ ] Test in product catalog
- [ ] Test in AR try-on
- [ ] Verify on mobile

---

## 📱 Mobile Upload

### Upload from Phone:

1. Take photo with phone
2. Edit/crop to square
3. Go to admin dashboard on phone
4. Click upload button
5. Select photo from gallery
6. Upload and save

**Note:** Works best on desktop for bulk uploads.

---

## 🚀 Bulk Upload Script

### For Uploading Many Products:

Create `bulk-upload.js`:

```javascript
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: 'AKIA2SBNPWS7SSPIQ6OW',
  secretAccessKey: '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',
  region: 'us-east-1'
});

async function uploadFile(filePath, s3Key) {
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: 'amz-s3-hackathon-wigs',
    Key: s3Key,
    Body: fileContent,
    ContentType: 'image/webp',
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  console.log(`✅ Uploaded: ${result.Location}`);
  return result.Location;
}

// Usage
uploadFile('./images/wig-thumbnail.webp', 'products/wigs/wig-thumbnail.webp');
```

---

## 📞 Need Help?

### Common Issues:

**"Upload button doesn't work"**
- Check if logged in as admin
- Verify backend is running
- Check browser console for errors

**"File too large"**
- Compress image
- Reduce dimensions
- Convert to WebP

**"Image doesn't display"**
- Check S3 URL is correct
- Verify bucket permissions
- Clear browser cache

---

## ✅ Summary

**To upload images from your computer:**

1. Go to http://localhost:3001/admin
2. Login as admin
3. Click "Add New Product" or "Edit"
4. Click upload buttons for each image type
5. Select files from your computer
6. Wait for upload to complete
7. Save product

**That's it!** The admin dashboard handles everything automatically. 🎃

---

## 🎨 Image Preparation Tools

**Recommended:**
- Remove.bg - Background removal
- TinyPNG.com - Compression
- Squoosh.app - Format conversion
- Photoshop/GIMP - Editing

**Your images should be:**
- Square (1:1 ratio)
- Optimized file size
- Correct dimensions
- Transparent background (AR only)

Ready to upload! 🚀
