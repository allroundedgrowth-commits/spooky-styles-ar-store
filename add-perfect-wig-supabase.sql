-- Add Perfect Wig Product for 2D AR Try-On (Supabase Version)
-- Run this directly in Supabase SQL Editor

-- This uses a FREE transparent PNG from pngarts.com for testing
-- Replace with your own images for production

DO $$
DECLARE
  new_product_id UUID;
BEGIN
  -- Insert the product
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
    NULL, -- No 3D model needed for 2D AR
    'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Purple+Wig',
    'https://via.placeholder.com/800x800/8b5cf6/ffffff?text=Purple+Wig+Detail',
    'https://www.pngarts.com/files/3/Purple-Hair-PNG-Image.png', -- FREE transparent PNG
    50,
    false
  )
  RETURNING id INTO new_product_id;

  -- Add color variations
  INSERT INTO product_colors (product_id, color_name, color_hex) VALUES
    (new_product_id, 'Deep Purple', '#8b5cf6'),
    (new_product_id, 'Violet Dream', '#a78bfa'),
    (new_product_id, 'Royal Purple', '#7c3aed'),
    (new_product_id, 'Lavender Mist', '#c4b5fd'),
    (new_product_id, 'Dark Plum', '#6d28d9');

  -- Show success message
  RAISE NOTICE 'Product created successfully with ID: %', new_product_id;
END $$;

-- Verify the product was created
SELECT 
  id,
  name,
  price,
  promotional_price,
  ar_image_url,
  (SELECT COUNT(*) FROM product_colors WHERE product_id = products.id) as color_count
FROM products
WHERE name = 'Perfect Fit Purple Wig';

-- NEXT STEPS:
-- 1. Visit your frontend: http://localhost:3000/products
-- 2. Find "Perfect Fit Purple Wig"
-- 3. Click "Try On" to test AR
-- 4. The wig should appear naturally on your face!

-- If you want to add more sample wigs with different colors:

-- Black Wig
-- INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
-- VALUES ('Perfect Fit Black Wig', 'Long flowing black wig...', 34.99, 29.99, 'wigs', 'witch', NULL, 'https://via.placeholder.com/400', 'https://via.placeholder.com/800', 'https://www.pngarts.com/files/3/Black-Hair-PNG-Image.png', 50, false);

-- Blonde Wig
-- INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
-- VALUES ('Perfect Fit Blonde Wig', 'Long flowing blonde wig...', 34.99, 29.99, 'wigs', 'witch', NULL, 'https://via.placeholder.com/400', 'https://via.placeholder.com/800', 'https://www.pngarts.com/files/3/Blonde-Hair-PNG-Image.png', 50, false);

-- Red Wig
-- INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
-- VALUES ('Perfect Fit Red Wig', 'Long flowing red wig...', 34.99, 29.99, 'wigs', 'witch', NULL, 'https://via.placeholder.com/400', 'https://via.placeholder.com/800', 'https://www.pngarts.com/files/3/Red-Hair-PNG-Image.png', 50, false);
