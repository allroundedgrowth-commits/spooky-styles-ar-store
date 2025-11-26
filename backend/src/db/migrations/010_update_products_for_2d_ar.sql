-- Migration: Update products table for 2D AR (remove 3D model requirement)
-- This migration makes model_url optional and adds image_url and ar_image_url for 2D AR

-- Step 1: Make model_url optional (can be NULL)
ALTER TABLE products 
ALTER COLUMN model_url DROP NOT NULL;

-- Step 2: Add image_url column for product detail images
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Step 3: Add ar_image_url column for AR overlay images
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ar_image_url VARCHAR(500);

-- Step 4: Update existing products to use thumbnail_url as fallback
-- (temporary until proper images are uploaded)
UPDATE products 
SET image_url = thumbnail_url 
WHERE image_url IS NULL;

UPDATE products 
SET ar_image_url = thumbnail_url 
WHERE ar_image_url IS NULL;

-- Step 5: Make new columns required
ALTER TABLE products 
ALTER COLUMN image_url SET NOT NULL;

ALTER TABLE products 
ALTER COLUMN ar_image_url SET NOT NULL;

-- Step 6: Add comments to clarify field usage
COMMENT ON COLUMN products.model_url IS 'Optional 3D model URL for advanced AR (not required for 2D AR)';
COMMENT ON COLUMN products.image_url IS 'Detail image for product page (800x800px recommended)';
COMMENT ON COLUMN products.ar_image_url IS 'Required PNG image with transparent background for 2D AR overlay (1200x1200px recommended)';
COMMENT ON COLUMN products.thumbnail_url IS 'Thumbnail image for product grid (400x400px recommended)';
