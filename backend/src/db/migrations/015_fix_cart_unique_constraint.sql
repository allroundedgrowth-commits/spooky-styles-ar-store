-- Fix cart table to prevent duplicate carts per user/session
-- Add unique constraint to ensure one cart per user or session

-- First, clean up duplicate carts, keeping only the most recent one for each user/session
WITH ranked_carts AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY COALESCE(user_id::text, session_id) 
           ORDER BY updated_at DESC
         ) as rn
  FROM carts
)
DELETE FROM carts 
WHERE id IN (
  SELECT id FROM ranked_carts WHERE rn > 1
);

-- Add unique constraint for authenticated users (one cart per user_id)
CREATE UNIQUE INDEX idx_carts_unique_user 
ON carts(user_id) 
WHERE user_id IS NOT NULL;

-- Add unique constraint for guest users (one cart per session_id where user_id is NULL)
CREATE UNIQUE INDEX idx_carts_unique_session 
ON carts(session_id) 
WHERE user_id IS NULL AND session_id IS NOT NULL;
