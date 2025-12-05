-- Add address fields to users table for saved shipping information
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address VARCHAR(255),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'US';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);

COMMENT ON COLUMN users.phone IS 'User phone number for shipping';
COMMENT ON COLUMN users.address IS 'Street address for shipping';
COMMENT ON COLUMN users.city IS 'City for shipping';
COMMENT ON COLUMN users.state IS 'State/Province for shipping';
COMMENT ON COLUMN users.zip_code IS 'ZIP/Postal code for shipping';
COMMENT ON COLUMN users.country IS 'Country code (ISO 3166-1 alpha-2)';
