-- Add a sample wig product with proper transparent AR image
-- This demonstrates the correct image setup for 2D AR try-on

-- IMPORTANT: Replace the ar_image_url with your actual transparent PNG image
-- The image MUST have:
-- 1. Transparent background (PNG with alpha channel)
-- 2. Square dimensions (1200x1200px recommended)
-- 3. Wig centered with hairline at bottom 1/3
-- 4. Clean edges without white/gray halos

INSERT INTO products (
  name,
  description,
  price,
  promotional_price,
  category,
  theme,
  model_url,
  thumbnail_url,
  image_url,
  ar_image_url,
  stock_quantity,
  is_accessory
) VALUES (
  'Perfect Fit Purple Wig',
  'Long flowing purple wig with natural waves. Professionally photographed with transparent background for perfect AR try-on experience. High-quality synthetic fibers that look and feel natural.',
  34.99,
  29.99,
  'wigs',
  'witch',
  NULL, -- 3D model not required for 2D AR
  
  -- Thumbnail: 400x400px, can have background
  'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Purple+Wig',
  
  -- Detail image: 800x800px, can have background
  'https://via.placeholder.com/800x800/8b5cf6/ffffff?text=Purple+Wig+Detail',
  
  -- AR image: MUST BE TRANSPARENT PNG, 1200x1200px
  -- Replace this with your actual transparent PNG URL
  -- For testing, you can use: https://www.pngarts.com/files/3/Purple-Hair-PNG-Image.png
  'https://www.pngarts.com/files/3/Purple-Hair-PNG-Image.png',
  
  50,
  false
) RETURNING id;

-- Add color variations
INSERT INTO product_colors (product_id, color_name, color_hex)
SELECT 
  id,
  color_name,
  color_hex
FROM products, (VALUES
  ('Deep Purple', '#8b5cf6'),
  ('Violet Dream', '#a78bfa'),
  ('Royal Purple', '#7c3aed'),
  ('Lavender Mist', '#c4b5fd'),
  ('Dark Plum', '#6d28d9')
) AS colors(color_name, color_hex)
WHERE name = 'Perfect Fit Purple Wig';

-- Verify the product was created
SELECT 
  id,
  name,
  ar_image_url,
  image_url,
  thumbnail_url,
  price
FROM products
WHERE name = 'Perfect Fit Purple Wig';

-- NEXT STEPS:
-- 1. Replace the ar_image_url with your own transparent PNG
-- 2. Test the product in the AR try-on page
-- 3. Adjust scale/offset in the AR config if needed
-- 4. If wig doesn't fit well, check image composition (see CREATE_PERFECT_WIG_PRODUCT.md)

-- TESTING URLS (Free transparent PNG wigs):
-- Purple: https://www.pngarts.com/files/3/Purple-Hair-PNG-Image.png
-- Black: https://www.pngarts.com/files/3/Black-Hair-PNG-Image.png
-- Blonde: https://www.pngarts.com/files/3/Blonde-Hair-PNG-Image.png
-- Red: https://www.pngarts.com/files/3/Red-Hair-PNG-Image.png

-- Note: These are example URLs. For production, upload your own images to S3/CDN
