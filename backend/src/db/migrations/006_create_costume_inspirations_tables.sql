-- Create costume_inspirations table
CREATE TABLE IF NOT EXISTS costume_inspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create costume_inspiration_products junction table
CREATE TABLE IF NOT EXISTS costume_inspiration_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspiration_id UUID NOT NULL REFERENCES costume_inspirations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(inspiration_id, product_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_costume_inspiration_products_inspiration_id 
  ON costume_inspiration_products(inspiration_id);
CREATE INDEX IF NOT EXISTS idx_costume_inspiration_products_product_id 
  ON costume_inspiration_products(product_id);
CREATE INDEX IF NOT EXISTS idx_costume_inspiration_products_display_order 
  ON costume_inspiration_products(inspiration_id, display_order);
