-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  promotional_price DECIMAL(10, 2) NULL,
  category VARCHAR(100) NOT NULL,
  theme VARCHAR(50) NOT NULL,
  model_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_accessory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_price CHECK (price > 0),
  CONSTRAINT positive_stock CHECK (stock_quantity >= 0)
);

-- Create indexes for faster filtering and searching
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_theme ON products(theme);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
