# Product Form Update Needed

## Current Issue

The ProductForm only has:
- ✅ Thumbnail upload
- ✅ 3D Model upload (required)

## What's Needed for 2D AR

The form needs THREE separate image uploads:
1. **Thumbnail** (400x400px) - For product grid
2. **Detail Image** (800x800px) - For product page
3. **AR Image** (1200x1200px PNG) - For AR overlay

And 3D model should be **optional** (not required).

## Required Changes

### 1. Update ProductFormData Interface

```typescript
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  promotional_price?: number;
  category: string;
  theme: string;
  thumbnail_url: string;      // 400x400
  image_url: string;           // 800x800 (NEW)
  ar_image_url: string;        // 1200x1200 PNG (NEW)
  model_url?: string;          // Optional (CHANGED)
  stock_quantity: number;
  is_accessory: boolean;
}
```

### 2. Add Three Upload Sections

**Thumbnail Upload (400x400):**
- Label: "Thumbnail Image (400x400px)"
- Accept: image/*
- Preview: Show uploaded image
- Help text: "Square image for product grid"

**Detail Image Upload (800x800):**
- Label: "Detail Image (800x800px)"
- Accept: image/*
- Preview: Show uploaded image
- Help text: "Square image for product page"

**AR Image Upload (1200x1200):**
- Label: "AR Overlay Image (1200x1200px)"
- Accept: image/png
- Preview: Show uploaded image with transparency
- Help text: "PNG with transparent background for AR try-on"

**3D Model Upload (Optional):**
- Label: "3D Model (Optional)"
- Accept: .glb,.gltf
- Help text: "Optional for future 3D AR"
- Remove "required" attribute

### 3. Add Upload Handlers

```typescript
const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
const [uploadingDetail, setUploadingDetail] = useState(false);
const [uploadingAR, setUploadingAR] = useState(false);

const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  setUploadingThumbnail(true);
  try {
    const result = await uploadService.uploadImage(file);
    setFormData(prev => ({ ...prev, thumbnail_url: result.webp.url }));
  } catch (err) {
    setError('Failed to upload thumbnail');
  } finally {
    setUploadingThumbnail(false);
  }
};

const handleDetailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  setUploadingDetail(true);
  try {
    const result = await uploadService.uploadImage(file);
    setFormData(prev => ({ ...prev, image_url: result.webp.url }));
  } catch (err) {
    setError('Failed to upload detail image');
  } finally {
    setUploadingDetail(false);
  }
};

const handleARUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate PNG
  if (file.type !== 'image/png') {
    setError('AR image must be PNG format');
    return;
  }
  
  setUploadingAR(true);
  try {
    const result = await uploadService.uploadImage(file);
    setFormData(prev => ({ ...prev, ar_image_url: result.original.url }));
  } catch (err) {
    setError('Failed to upload AR image');
  } finally {
    setUploadingAR(false);
  }
};
```

## Quick Fix Option

Since updating the form is complex, here's a **workaround**:

### Option 1: Use Same Image for All Three

In the form submission, duplicate the thumbnail URL:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const submitData = {
    ...formData,
    image_url: formData.thumbnail_url,      // Use thumbnail as detail
    ar_image_url: formData.thumbnail_url,   // Use thumbnail as AR
    model_url: formData.model_url || null,  // Make optional
  };
  
  await onSubmit(submitData);
};
```

### Option 2: Manual URL Entry

For now, you can:
1. Upload images to S3 manually
2. Paste URLs into the form fields
3. Add the missing fields to the form HTML

## Temporary Solution

Until the form is updated, you can:

1. **Upload via AWS CLI:**
```bash
aws s3 cp thumbnail.webp s3://amz-s3-hackathon-wigs/products/wigs/
aws s3 cp detail.webp s3://amz-s3-hackathon-wigs/products/wigs/
aws s3 cp ar.png s3://amz-s3-hackathon-wigs/products/wigs/
```

2. **Update database directly:**
```sql
UPDATE products 
SET 
  thumbnail_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/thumbnail.webp',
  image_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/detail.webp',
  ar_image_url = 'https://s3.amazonaws.com/amz-s3-hackathon-wigs/products/wigs/ar.png',
  model_url = NULL
WHERE id = 'product-id';
```

## Why Upload Button Not Working

The upload button might not work because:
1. AWS credentials not configured
2. Backend upload route not working
3. CORS issues
4. File size too large
5. Network error

**Check browser console (F12) for errors when clicking upload.**

## Next Steps

1. Check browser console for upload errors
2. Verify AWS credentials in `.env`
3. Test backend upload endpoint
4. Update ProductForm component with three image uploads
5. Make 3D model optional

Would you like me to update the ProductForm component now with all three image upload fields?
