# Image Aspect Ratios - Complete Guide

## 📐 All Images Use 1:1 (Square) Ratio

**All product images should be SQUARE (1:1 aspect ratio)** for consistency and optimal display.

---

## Image Specifications with Aspect Ratios

### 1. Thumbnail (Product Grid)
```
Dimensions: 400 x 400 pixels
Aspect Ratio: 1:1 (Square)
Format: WebP
Quality: 85%
Max Size: 50KB
```

**Why 1:1?**
- Consistent grid layout
- No cropping issues
- Works on all screen sizes
- Easy to center product

---

### 2. Detail Image (Product Page)
```
Dimensions: 800 x 800 pixels
Aspect Ratio: 1:1 (Square)
Format: WebP
Quality: 90%
Max Size: 150KB
```

**Why 1:1?**
- Matches thumbnail ratio
- Clean product display
- Easy zoom functionality
- Standard e-commerce format

---

### 3. AR Overlay Image (Try-On)
```
Dimensions: 1200 x 1200 pixels
Aspect Ratio: 1:1 (Square)
Format: PNG with transparency
Quality: 95%
Max Size: 300KB
```

**Why 1:1?**
- Easy to scale uniformly
- Centered overlay on any photo
- No distortion when resizing
- Works in portrait and landscape

---

## Visual Comparison

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ALL PRODUCT IMAGES: 1:1 (SQUARE)                     │
│                                                         │
│  ┌──────────┐  ┌────────────────┐  ┌──────────────────┐│
│  │          │  │                │  │                  ││
│  │  400x400 │  │    800x800     │  │    1200x1200     ││
│  │          │  │                │  │                  ││
│  │ Thumbnail│  │     Detail     │  │    AR Overlay    ││
│  │          │  │                │  │                  ││
│  └──────────┘  └────────────────┘  └──────────────────┘│
│                                                         │
│     1:1            1:1                 1:1             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Common Aspect Ratios (For Reference)

### Standard Ratios:
- **1:1** (Square) - **← WE USE THIS**
- 4:3 (Traditional) - 800x600, 1024x768
- 16:9 (Widescreen) - 1920x1080, 1280x720
- 3:2 (Photography) - 1500x1000, 3000x2000
- 9:16 (Vertical/Mobile) - 1080x1920, 720x1280

### Why NOT Other Ratios?

**4:3 (800x600):**
- ❌ Doesn't fit square grid
- ❌ Requires cropping
- ❌ Inconsistent display

**16:9 (1920x1080):**
- ❌ Too wide for products
- ❌ Wastes space
- ❌ Poor mobile display

**9:16 (1080x1920):**
- ❌ Too tall
- ❌ Doesn't work for AR overlay
- ❌ Awkward in grid

---

## Preparing Images for 1:1 Ratio

### If Your Source Image is NOT Square:

#### Option 1: Crop to Square (Recommended)
```bash
# Using ImageMagick
convert input.jpg -gravity center -crop 1:1 +repage output.jpg
```

#### Option 2: Add Padding
```bash
# Add transparent padding to make square
convert input.png -gravity center -background none -extent 1200x1200 output.png
```

#### Option 3: Photoshop
1. Open image
2. Image → Canvas Size
3. Check "Relative"
4. Make width = height
5. Choose anchor point (center)
6. Fill with transparent or white

---

## Examples by Product Type

### Wigs (1:1 Square)
```
┌────────────────┐
│                │
│                │  ← Hair at top
│    ┌────┐     │
│    │ WIG│     │  ← Centered
│    └────┘     │
│                │
│                │  ← Hair at bottom
└────────────────┘
   1200 x 1200
```

### Accessories (1:1 Square)
```
┌────────────────┐
│                │
│                │
│   ┌────────┐  │
│   │  HAT   │  │  ← Centered
│   └────────┘  │
│                │
│                │
└────────────────┘
   1200 x 1200
```

### Earrings (1:1 Square)
```
┌────────────────┐
│                │
│  ┌──┐    ┌──┐ │
│  │  │    │  │ │  ← Pair centered
│  └──┘    └──┘ │
│                │
│                │
└────────────────┘
   1200 x 1200
```

---

## Responsive Display

### How 1:1 Images Display:

**Desktop (Grid):**
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1:1│ │ 1:1│ │ 1:1│ │ 1:1│
└────┘ └────┘ └────┘ └────┘
```

**Tablet (Grid):**
```
┌──────┐ ┌──────┐
│  1:1 │ │  1:1 │
└──────┘ └──────┘
```

**Mobile (Grid):**
```
┌────────────┐
│    1:1     │
└────────────┘
┌────────────┐
│    1:1     │
└────────────┘
```

**AR Overlay (Any Device):**
```
User Photo (any ratio)
        +
AR Image (1:1)
        =
Perfect Overlay
```

---

## Quick Reference Table

| Image Type | Pixels | Ratio | Format | Size |
|------------|--------|-------|--------|------|
| Thumbnail | 400x400 | **1:1** | WebP | <50KB |
| Detail | 800x800 | **1:1** | WebP | <150KB |
| AR Overlay | 1200x1200 | **1:1** | PNG | <300KB |

---

## Image Preparation Checklist

### For Each Product:

- [ ] Source image is high quality
- [ ] Crop or pad to **1:1 square ratio**
- [ ] Remove background (for AR image)
- [ ] Center product in frame
- [ ] Leave 10-15% padding around edges
- [ ] Export 3 sizes: 400px, 800px, 1200px
- [ ] Optimize file sizes
- [ ] Test in product grid
- [ ] Test in AR try-on

---

## Common Questions

### Q: Can I use 4:3 or 16:9 images?
**A:** No. All images must be 1:1 (square) for consistency.

### Q: What if my product photo is rectangular?
**A:** Crop to square or add padding to make it square.

### Q: Do I need different ratios for mobile?
**A:** No. 1:1 works perfectly on all devices.

### Q: What about banner images?
**A:** Banners can be 16:9 or other ratios, but product images must be 1:1.

### Q: Why not use the original photo ratio?
**A:** 1:1 ensures:
- Consistent grid layout
- No cropping surprises
- Perfect AR overlay
- Professional appearance

---

## Summary

**All product images = 1:1 (Square)**

- Thumbnail: 400x400 (1:1)
- Detail: 800x800 (1:1)
- AR: 1200x1200 (1:1)

**No other ratios needed!** 🎃

This keeps everything simple, consistent, and professional.
