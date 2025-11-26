# Upload Images - Simple Guide

## ✅ You Can Already Upload Images!

The admin dashboard has built-in image upload functionality.

---

## 🎯 3 Simple Steps

### Step 1: Go to Admin Dashboard
```
http://localhost:3001/admin
```
Login with your admin credentials.

### Step 2: Add or Edit Product
- Click "Add New Product" button
- OR click "Edit" on existing product

### Step 3: Upload Images
- Click "Upload Image" button
- Select file from your computer
- Wait for upload
- Save product

**That's it!** ✅

---

## 📸 What Images to Upload

### You need 3 images per product:

1. **Thumbnail** (400x400px)
   - For product grid
   - WebP or JPG
   - < 50KB

2. **Detail Image** (800x800px)
   - For product page
   - WebP or JPG
   - < 150KB

3. **AR Image** (1200x1200px)
   - For AR try-on
   - PNG with transparent background
   - < 300KB

**All images must be SQUARE (1:1 ratio)**

---

## 🖼️ Image Requirements

### Critical:
- ✅ Square format (1:1 ratio)
- ✅ Correct size (400/800/1200px)
- ✅ AR image = PNG with transparency
- ✅ Other images = WebP or JPG

### File Types Accepted:
- JPG/JPEG
- PNG
- WebP
- GIF

### Max File Sizes:
- Images: 5MB
- 3D Models: 50MB (optional)

---

## 🎨 Before Uploading

### Prepare Your Images:

1. **Remove background** (for AR image)
   - Use Remove.bg
   - Save as PNG

2. **Make square** (1:1 ratio)
   - Crop to square
   - Or add padding

3. **Resize to 3 sizes**
   - 400x400px
   - 800x800px
   - 1200x1200px

4. **Optimize file size**
   - Use TinyPNG.com
   - Compress images

---

## 🚀 Upload Process

### In Admin Dashboard:

```
1. Login to admin
   ↓
2. Click "Add New Product"
   ↓
3. Fill product details
   ↓
4. Click "Upload Thumbnail"
   ↓
5. Select 400x400px image
   ↓
6. Wait for upload
   ↓
7. Click "Upload Detail Image"
   ↓
8. Select 800x800px image
   ↓
9. Wait for upload
   ↓
10. Click "Upload AR Image"
    ↓
11. Select 1200x1200px PNG
    ↓
12. Wait for upload
    ↓
13. Click "Save Product"
    ↓
14. Done! ✅
```

---

## 💡 Quick Tips

### Do:
- ✅ Use square images (1:1)
- ✅ Remove background for AR
- ✅ Compress images
- ✅ Use descriptive names
- ✅ Test after uploading

### Don't:
- ❌ Use rectangular images
- ❌ Upload huge files
- ❌ Forget transparent background (AR)
- ❌ Skip optimization
- ❌ Use random filenames

---

## 🔧 Troubleshooting

### Upload Not Working?

**Check:**
1. Are you logged in as admin?
2. Is backend running?
3. Is file size under 5MB?
4. Is file type supported?

**Fix:**
- Refresh page
- Check browser console (F12)
- Compress image
- Try different browser

---

## 📱 Where Images Appear

### After Upload:

**Thumbnail (400x400):**
- Product catalog grid
- Cart items
- Order history

**Detail (800x800):**
- Product detail page
- Image gallery
- Zoom view

**AR (1200x1200):**
- AR try-on overlay
- Virtual fitting
- Screenshot capture

---

## ✅ Upload Checklist

### Before Clicking Upload:

- [ ] Image is square (1:1)
- [ ] Correct size (400/800/1200px)
- [ ] File size under limit
- [ ] AR image is PNG
- [ ] AR image has transparency
- [ ] Image is optimized
- [ ] Logged into admin
- [ ] Backend is running

---

## 🎯 Example Workflow

### Complete Example:

**Product: Long Black Wig**

1. **Prepare Images:**
   - Take photo of wig
   - Remove background (Remove.bg)
   - Create 3 sizes:
     - `wig-black-thumb.webp` (400x400)
     - `wig-black-detail.webp` (800x800)
     - `wig-black-ar.png` (1200x1200, transparent)

2. **Upload:**
   - Go to admin dashboard
   - Click "Add New Product"
   - Name: "Long Black Wig"
   - Price: $49.99
   - Click "Upload Thumbnail"
   - Select `wig-black-thumb.webp`
   - Click "Upload Detail"
   - Select `wig-black-detail.webp`
   - Click "Upload AR"
   - Select `wig-black-ar.png`
   - Click "Save"

3. **Test:**
   - View in product catalog
   - Check product page
   - Test AR try-on
   - Verify on mobile

**Done!** ✅

---

## 📞 Need Help?

### Common Questions:

**Q: Where do I upload images?**
A: Admin dashboard → Add/Edit Product → Upload buttons

**Q: What size should images be?**
A: 400x400, 800x800, and 1200x1200 pixels (all square)

**Q: What format for AR images?**
A: PNG with transparent background

**Q: Can I upload from my phone?**
A: Yes! Works on mobile browsers too

**Q: How many images per product?**
A: 3 images (thumbnail, detail, AR)

---

## 🎨 Tools You Need

**Free Tools:**
- Remove.bg - Remove backgrounds
- TinyPNG.com - Compress images
- Squoosh.app - Resize & convert
- Photopea.com - Free Photoshop alternative

**Paid Tools:**
- Photoshop - Professional editing
- Canva Pro - Easy design

---

## ✅ Summary

**Upload images in 3 steps:**

1. **Go to admin** → http://localhost:3001/admin
2. **Add/Edit product** → Click upload buttons
3. **Select files** → Wait → Save

**Image requirements:**
- Square (1:1 ratio)
- 3 sizes: 400px, 800px, 1200px
- AR = PNG with transparency
- Others = WebP or JPG

**That's all you need to know!** 🎃

Start uploading your product images now! 🚀
