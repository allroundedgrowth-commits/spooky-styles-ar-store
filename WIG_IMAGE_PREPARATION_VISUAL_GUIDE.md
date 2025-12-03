# Visual Guide: Preparing Wig Images for Perfect AR Try-On

## Understanding the Problem

### ❌ BAD: Image with Background
```
┌─────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░ │ ← White/gray background
│ ░░░░░░████████░░░░░░░░░ │
│ ░░░░██████████████░░░░░ │
│ ░░░████████████████░░░░ │ ← Wig with background
│ ░░████████████████████░ │
│ ░░░████████████████░░░░ │
│ ░░░░██████████████░░░░░ │
│ ░░░░░░████████░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────┘
Result: White box appears around wig in AR
```

### ✅ GOOD: Transparent PNG
```
┌─────────────────────────┐
│                         │ ← Transparent (no background)
│       ████████          │
│     ██████████████      │
│    ████████████████     │ ← Wig only, clean edges
│   ██████████████████    │
│    ████████████████     │
│     ██████████████      │
│       ████████          │
│                         │
└─────────────────────────┘
Result: Wig blends naturally with user's face
```

## Step-by-Step: Creating Perfect Wig Images

### Step 1: Find or Photograph Your Wig

**Option A: Use Existing Photos**
- Search "wig PNG transparent" on Google Images
- Filter by "Transparent" in Tools menu
- Download high-resolution images (1000x1000px minimum)

**Option B: Photograph Your Own**
- Use good lighting (natural daylight is best)
- Place wig on mannequin or model
- Use plain, contrasting background (makes removal easier)
- Take photo straight-on, not at an angle
- Ensure wig is centered and fills frame

### Step 2: Remove Background

**Using remove.bg (Easiest - Recommended)**
1. Go to https://www.remove.bg/
2. Upload your wig image
3. Wait for automatic background removal
4. Download as PNG
5. ✅ Done! Background is transparent

**Using Photoshop**
1. Open image in Photoshop
2. Select > Subject (AI selection)
3. Select > Inverse
4. Delete background
5. Select > Modify > Contract (1-2px)
6. Select > Modify > Feather (0.5px)
7. File > Export > PNG (with transparency)

**Using GIMP (Free)**
1. Open image in GIMP
2. Layer > Transparency > Add Alpha Channel
3. Select by Color tool (click background)
4. Delete background
5. Select > Shrink (1px)
6. Select > Feather (0.5px)
7. File > Export As > PNG

### Step 3: Crop and Position

**Correct Positioning:**
```
┌─────────────────┐
│                 │ ← 20% empty space (top)
│   ████████████  │ ← Top of wig (crown)
│  ██████████████ │
│ ████████████████│
│ ████████████████│ ← Middle of wig
│ ████████████████│
│ ████████████████│
│  ██████████████ │
│   ████████████  │ ← Bottom of wig (hairline)
│                 │ ← 10% empty space (bottom)
└─────────────────┘

Measurements:
- Top space: 20% of image height
- Wig: 70% of image height
- Bottom space: 10% of image height
- Wig width: 60-80% of image width
- Centered horizontally
```

**How to Crop:**
1. Open transparent PNG in image editor
2. Image > Canvas Size > 1200x1200px
3. Position wig so hairline is at 70% from top
4. Ensure wig is centered horizontally
5. Save as PNG

### Step 4: Verify Transparency

**Checkerboard Test:**
```
Most image editors show transparency as a checkerboard pattern:

✅ GOOD:
┌─────────────────┐
│ ▓░▓░▓░▓░▓░▓░▓░▓ │ ← Checkerboard visible = transparent
│ ░▓░▓████████▓░▓ │
│ ▓░▓██████████░▓ │
│ ░▓████████████▓ │ ← Wig with clean edges
│ ▓░████████████░ │
│ ░▓░██████████▓░ │
│ ▓░▓░████████░▓░ │
│ ░▓░▓░▓░▓░▓░▓░▓░ │
└─────────────────┘

❌ BAD:
┌─────────────────┐
│ ░░░░░░░░░░░░░░░ │ ← White/gray = not transparent
│ ░░░░████████░░░ │
│ ░░██████████░░░ │
│ ░████████████░░ │ ← White halo around edges
│ ░████████████░░ │
│ ░░██████████░░░ │
│ ░░░░████████░░░ │
│ ░░░░░░░░░░░░░░░ │
└─────────────────┘
```

**Color Background Test:**
1. Add a bright colored layer behind wig (red, blue, green)
2. If you see white/gray edges = transparency not clean
3. If wig edges blend perfectly = transparency is good

### Step 5: Optimize File Size

**Target:**
- File size: 200KB - 1MB
- Dimensions: 1200x1200px
- Format: PNG-24 (with alpha)

**Tools:**
- TinyPNG: https://tinypng.com/ (compress without quality loss)
- Squoosh: https://squoosh.app/ (Google's optimizer)
- ImageOptim (Mac): https://imageoptim.com/

**Settings:**
- PNG-24 (not PNG-8)
- Preserve transparency
- Quality: 80-90%
- Remove metadata

## Common Issues & Visual Fixes

### Issue 1: White Halo Around Wig

**Problem:**
```
┌─────────────────┐
│                 │
│   ░░████████░░  │ ← Gray/white halo
│  ░░██████████░░ │
│ ░░████████████░░│
└─────────────────┘
```

**Fix:**
1. Select wig in image editor
2. Select > Modify > Contract (1-2px)
3. Select > Inverse
4. Delete
5. This removes the halo pixels

### Issue 2: Wig Too Small in AR

**Problem:**
```
User's head:        Wig overlay:
┌─────────────┐    ┌─────────────┐
│   ┌─────┐   │    │             │
│   │ 👤  │   │    │   ┌─────┐   │ ← Wig too small
│   │     │   │    │   │ wig │   │
│   └─────┘   │    │   └─────┘   │
└─────────────┘    └─────────────┘
```

**Fix:**
- Wig should fill 60-80% of image width
- Crop image tighter around wig
- Ensure wig is properly centered

### Issue 3: Wig Positioned Too High/Low

**Problem:**
```
Too High:              Too Low:
┌─────────────┐       ┌─────────────┐
│             │       │   ████████  │
│   ████████  │       │  ██████████ │
│  ██████████ │       │ ████████████│
│ ████████████│       │ ████████████│
│             │       │             │
│             │       │             │
└─────────────┘       └─────────────┘

Correct:
┌─────────────┐
│             │ ← 20% space
│   ████████  │
│  ██████████ │
│ ████████████│ ← Wig centered
│ ████████████│
│   ████████  │ ← Hairline at 70%
│             │ ← 10% space
└─────────────┘
```

**Fix:**
- Adjust canvas size and position
- Hairline should be at 70% from top
- Leave 20% space at top for wig volume

## Testing Your Image

### Quick Test Checklist
- [ ] Open PNG in image editor
- [ ] See checkerboard pattern (transparency)
- [ ] No white/gray halos around edges
- [ ] Wig is centered horizontally
- [ ] Hairline at bottom 1/3 of image
- [ ] Image is 1200x1200px or larger
- [ ] File size under 2MB
- [ ] File format is PNG (not JPG)

### AR Test Checklist
- [ ] Upload to your CDN/S3
- [ ] Add product with ar_image_url
- [ ] Open AR try-on page
- [ ] Wig appears without white box
- [ ] Wig fits head naturally
- [ ] Wig moves with head tracking
- [ ] Edges blend smoothly
- [ ] No visible artifacts

## Example: Perfect Wig Image Specs

```
Filename: purple-cascade-ar.png
Format: PNG-24 with alpha channel
Dimensions: 1200 x 1200 pixels
File Size: 450 KB
Color Space: sRGB
Bit Depth: 32-bit (8-bit RGB + 8-bit alpha)

Composition:
- Top margin: 240px (20%)
- Wig height: 840px (70%)
- Bottom margin: 120px (10%)
- Wig width: 840px (70%)
- Horizontal center: 600px

Transparency:
- Background: 100% transparent (alpha = 0)
- Wig edges: Smooth anti-aliasing
- No white/gray halos
- Clean alpha channel
```

## Free Resources

### Stock Images (Transparent PNGs)
- PNGTree: https://pngtree.com/free-png/wig
- PNGWing: https://www.pngwing.com/en/search?q=wig
- FreePNGImg: https://www.freepngimg.com/
- PNGArts: https://www.pngarts.com/

### Background Removal Tools
- remove.bg: https://www.remove.bg/ (best quality)
- Adobe Express: https://www.adobe.com/express/feature/image/remove-background
- Canva: https://www.canva.com/features/background-remover/
- Photopea: https://www.photopea.com/ (free Photoshop alternative)

### Image Editors
- GIMP: https://www.gimp.org/ (free, powerful)
- Paint.NET: https://www.getpaint.net/ (Windows, simple)
- Photopea: https://www.photopea.com/ (browser-based)

### Optimization Tools
- TinyPNG: https://tinypng.com/
- Squoosh: https://squoosh.app/
- ImageOptim: https://imageoptim.com/ (Mac)

## Need More Help?

If you're still having issues:
1. Check CREATE_PERFECT_WIG_PRODUCT.md for detailed requirements
2. Run `node add-perfect-wig.js` to add a sample product
3. Test with the sample transparent PNGs provided
4. Compare your image to the working samples
5. Verify transparency in multiple image editors

The AR engine is working perfectly - it just needs properly prepared images! 🎃
