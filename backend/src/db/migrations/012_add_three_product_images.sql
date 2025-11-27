-- Migration: Add support for three product images (400x400px thumbnails)
-- First image (image_url) is mandatory, second and third are optional

-- Add columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url_secondary') THEN
        ALTER TABLE products ADD COLUMN image_url_secondary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url_tertiary') THEN
        ALTER TABLE products ADD COLUMN image_url_tertiary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_alt_text') THEN
        ALTER TABLE products ADD COLUMN image_alt_text TEXT DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_alt_text_secondary') THEN
        ALTER TABLE products ADD COLUMN image_alt_text_secondary TEXT DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_alt_text_tertiary') THEN
        ALTER TABLE products ADD COLUMN image_alt_text_tertiary TEXT DEFAULT '';
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_all_images ON products(image_url, image_url_secondary, image_url_tertiary);

-- Add comments for documentation
COMMENT ON COLUMN products.image_url IS 'Primary product image (required) - 400x400px recommended';
COMMENT ON COLUMN products.image_url_secondary IS 'Secondary product image (optional) - 400x400px recommended';
COMMENT ON COLUMN products.image_url_tertiary IS 'Tertiary product image (optional) - 400x400px recommended';
COMMENT ON COLUMN products.image_alt_text IS 'Alt text for primary image (accessibility)';
COMMENT ON COLUMN products.image_alt_text_secondary IS 'Alt text for secondary image (accessibility)';
COMMENT ON COLUMN products.image_alt_text_tertiary IS 'Alt text for tertiary image (accessibility)';
