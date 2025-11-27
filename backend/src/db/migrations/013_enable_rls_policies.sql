-- Migration: Enable Row Level Security (RLS) Policies
-- Description: Implements database-level security policies for user data protection
-- Requirements: 1.1, 1.2, 1.3, 1.4, 1.5

-- ============================================================================
-- STEP 1: Enable RLS on all sensitive tables
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cart_items table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create RLS policies for users table
-- ============================================================================

-- Policy: Users can view their own user record
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Users can update their own user record
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Policy: Admins can view all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id::text = auth.uid()::text
      AND u.is_admin = true
    )
  );

-- Policy: Admins can update all users
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id::text = auth.uid()::text
      AND u.is_admin = true
    )
  );

-- ============================================================================
-- STEP 3: Create RLS policies for orders table
-- ============================================================================

-- Policy: Users can view only their own orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy: Admins can view all orders
CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- Policy: Users can insert their own orders
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Admins can update any order
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- Policy: Admins can delete any order
CREATE POLICY "orders_delete_admin" ON orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- ============================================================================
-- STEP 4: Create RLS policies for order_items table
-- ============================================================================

-- Policy: Users can view order items for their own orders
CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Policy: Admins can view all order items
CREATE POLICY "order_items_select_admin" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- Policy: Users can insert order items for their own orders
CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Policy: Admins can modify all order items
CREATE POLICY "order_items_modify_admin" ON order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- ============================================================================
-- STEP 5: Create RLS policies for cart_items table
-- ============================================================================

-- Policy: Users have full access to their own cart items
CREATE POLICY "cart_items_all_own" ON cart_items
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Policy: Admins can view all cart items
CREATE POLICY "cart_items_admin" ON cart_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- ============================================================================
-- STEP 6: Create RLS policies for products table
-- ============================================================================

-- Policy: Public read access to all products
CREATE POLICY "products_select_all" ON products
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert products
CREATE POLICY "products_insert_admin" ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- Policy: Only admins can update products
CREATE POLICY "products_update_admin" ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- Policy: Only admins can delete products
CREATE POLICY "products_delete_admin" ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- ============================================================================
-- STEP 7: Add database indexes for RLS performance
-- ============================================================================

-- Index on orders(user_id) for faster RLS filtering
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Index on order_items(order_id) for join performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index on users(is_admin) for admin checks
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Index on cart_items(user_id) for faster cart queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- ============================================================================
-- STEP 8: Enable Realtime for products table (Requirement 2.2)
-- ============================================================================

-- Enable Realtime replication for products table
-- This allows clients to subscribe to real-time inventory updates
-- Requirement: 2.2 - THE Supabase SHALL provide Realtime subscriptions for product inventory changes

ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ============================================================================
-- STEP 9: Enable Realtime for orders table (Requirement 3.2)
-- ============================================================================

-- Enable Realtime replication for orders table
-- This allows clients to subscribe to real-time order status updates
-- Requirement: 3.2 - THE Supabase SHALL filter Realtime order updates to only notify the user who owns the order

ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable Realtime replication for order_items table (for complete order updates)
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- ============================================================================
-- REALTIME SETUP INSTRUCTIONS
-- ============================================================================
--
-- After running this migration, complete the following steps in Supabase Dashboard:
--
-- 1. Navigate to Database > Replication in Supabase Dashboard
-- 2. Verify that 'products', 'orders', and 'order_items' tables appear in the Realtime publication
-- 3. Ensure Realtime is enabled for your project (Settings > API)
-- 4. Note: Free tier supports up to 200 concurrent Realtime connections
-- 5. Realtime updates will respect RLS policies automatically
--
-- Frontend clients can now subscribe to product changes:
--   supabase.channel('products')
--     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, callback)
--     .subscribe()
--
-- Frontend clients can subscribe to order changes (RLS automatically filters to user's orders):
--   supabase.channel('user-orders')
--     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, callback)
--     .subscribe()

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. RLS policies use auth.uid() which comes from JWT token set in Supabase client
-- 2. All policies default to DENY unless explicitly granted
-- 3. Admin users have full access through separate policies
-- 4. Indexes improve RLS policy performance for large datasets
-- 5. Guest orders (user_id IS NULL) are not covered by these policies
--    and require separate handling in application logic
-- 6. Realtime subscriptions automatically respect RLS policies
-- 7. Product inventory updates will broadcast to all connected clients within 1 second
-- 8. Order status updates will only be sent to the user who owns the order (RLS filtering)
-- 9. Order notifications will be delivered within 2 seconds of status change
