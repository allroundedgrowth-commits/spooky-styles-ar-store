# Three Thumbnails Quick Start Guide

## 🚀 Quick Setup (Already Done!)

✅ Database migration applied  
✅ Backend service updated  
✅ Frontend form updated  
✅ TypeScript types updated

## 📸 Using Three Thumbnails

### Admin Dashboard

1. **Navigate to Admin**
   ```
   http://localhost:5173/admin
   ```

2. **Create/Edit Product**
   - Click "Add Product" or edit existing product

3. **Upload Images (400x400px recommended)**

   **Image 1 (Required):**
   - Upload file or paste URL
   - Add alt text: "Product name - front view"
   
   **Image 2 (Optional):**
   - Upload file or paste URL
   - Add alt text: "Product name - side view"
   
   **Image 3 (Optional):**
   - Upload file or paste URL
   - Add alt text: "Product name - back view"

4. **Save Product**

## 🎯 Image Guidelines

### Dimensions
- **All images**: 400x400px (square)
- **Format**: JPEG, PNG, or WebP
- **Max size**: 5MB per image

### Best Practices
```
✅ DO:
- Use square images (1:1 ratio)
- Show different angles
- Compress before upload
- Add descriptive alt text
- Use consistent lighting

❌ DON'T:
- Use different aspect ratios
- Upload huge files (>5MB)
- Skip alt text
- Use blurry images
```

## 💻 API Usage

### Create Product with 3 Images
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Spooky Purple Wig",
    "description": "Long flowing purple wig",
    "price": 29.99,
    "category": "Wigs",
    "theme": "witch",
    "thumbnail_url": "https://cdn.example.com/thumb.webp",
    "image_url": "https://cdn.example.com/image1.webp",
    "image_url_secondary": "https://cdn.example.com/image2.webp",
    "image_url_tertiary": "https://cdn.example.com/image3.webp",
    "image_alt_text": "Purple wig front view",
    "image_alt_text_secondary": "Purple wig side view",
    "image_alt_text_tertiary": "Purple wig back view",
    "ar_image_url": "https://cdn.example.com/ar.png",
    "stock_quantity": 50,
    "is_accessory": false
  }'
```

### Update Product Images
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "image_url_secondary": "https://cdn.example.com/new-angle.webp",
    "image_alt_text_secondary": "Updated side view"
  }'
```

## 🔍 Testing

### Test Scenarios
```bash
# 1. Product with only required image
✅ image_url: "https://..."
❌ image_url_secondary: null
❌ image_url_tertiary: null

# 2. Product with 2 images
✅ image_url: "https://..."
✅ image_url_secondary: "https://..."
❌ image_url_tertiary: null

# 3. Product with all 3 images
✅ image_url: "https://..."
✅ image_url_secondary: "https://..."
✅ image_url_tertiary: "https://..."
```

## 🐛 Troubleshooting

### Image not uploading?
- Check file size (max 5MB)
- Verify format (JPEG, PNG, WebP)
- Check network connection
- Look for error messages

### Alt text not saving?
- Ensure field is filled before saving
- Check for special characters
- Verify form submission

### Images not displaying?
- Verify URL is accessible
- Check CORS settings
- Inspect browser console
- Verify image format

## 📊 Database Schema

```sql
-- Check your product images
SELECT 
  id, 
  name,
  image_url,
  image_url_secondary,
  image_url_tertiary,
  image_alt_text
FROM products
LIMIT 5;
```

## 🎨 Frontend Integration (Future)

### Display Image Gallery
```typescript
// Get all available images
const images = [
  { url: product.image_url, alt: product.image_alt_text },
  ...(product.image_url_secondary ? [{ 
    url: product.image_url_secondary, 
    alt: product.image_alt_text_secondary 
  }] : []),
  ...(product.image_url_tertiary ? [{ 
    url: product.image_url_tertiary, 
    alt: product.image_alt_text_tertiary 
  }] : [])
];

// Render gallery
{images.map((img, index) => (
  <img key={index} src={img.url} alt={img.alt} />
))}
```

## ✅ Checklist

- [ ] Migration applied successfully
- [ ] Admin form shows 3 upload sections
- [ ] Can upload images via file picker
- [ ] Can paste image URLs
- [ ] Alt text fields work
- [ ] Image previews display
- [ ] Can save product with 1-3 images
- [ ] API returns all image fields
- [ ] Existing products still work

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify database migration ran
3. Restart backend server
4. Clear browser cache
5. Check network tab for failed requests

---

**Ready to use!** Start uploading products with multiple angles to give customers a better view of your products.
