-- Add guest checkout fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_address JSONB;

-- Create index on guest_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);

-- Update user_id constraint to allow NULL for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN orders.guest_email IS 'Email address for guest checkout orders';
COMMENT ON COLUMN orders.guest_name IS 'Full name for guest checkout orders';
COMMENT ON COLUMN orders.guest_address IS 'Shipping address JSON for guest checkout orders';
