-- Migration: Add third product image support
-- Three thumbnails: primary (mandatory), secondary (optional), tertiary (optional)

ALTER TABLE products 
ADD COLUMN image_url_tertiary TEXT,
ADD COLUMN image_alt_text_tertiary TEXT DEFAULT '';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_all_images ON products(image_url, image_url_secondary, image_url_tertiary);

-- Add comment for documentation
COMMENT ON COLUMN products.image_url IS 'Primary product image (required) - 400x400px recommended';
COMMENT ON COLUMN products.image_url_secondary IS 'Secondary product image (optional) - 400x400px recommended';
COMMENT ON COLUMN products.image_url_tertiary IS 'Tertiary product image (optional) - 400x400px recommended';
