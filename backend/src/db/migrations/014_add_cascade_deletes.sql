-- Add CASCADE delete rules to foreign keys to allow product deletion
-- This migration fixes the delete issue by ensuring related records are cleaned up

-- Drop existing foreign key constraints and recreate with CASCADE
ALTER TABLE product_colors 
  DROP CONSTRAINT IF EXISTS product_colors_product_id_fkey,
  ADD CONSTRAINT product_colors_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE cart_items 
  DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey,
  ADD CONSTRAINT cart_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE order_items 
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey,
  ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Add index for better delete performance
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
