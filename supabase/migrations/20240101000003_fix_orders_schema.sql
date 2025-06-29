-- Fix orders table schema to match the code expectations
-- Add missing columns and rename columns to match the code

-- Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_id uuid DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS order_number text,
ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Update existing orders to have order_id if null
UPDATE orders SET order_id = id WHERE order_id IS NULL;

-- Make order_id the primary key instead of id
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE orders ADD PRIMARY KEY (order_id);

-- Drop the old id column
ALTER TABLE orders DROP COLUMN IF EXISTS id;

-- Fix order_items table to match code expectations
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS unit_price decimal(10,2),
ADD COLUMN IF NOT EXISTS total_price decimal(10,2);

-- Update existing order_items to populate unit_price and total_price from price_at_time
UPDATE order_items SET 
  unit_price = price_at_time,
  total_price = price_at_time * quantity
WHERE unit_price IS NULL;

-- Make unit_price and total_price NOT NULL
ALTER TABLE order_items 
ALTER COLUMN unit_price SET NOT NULL,
ALTER COLUMN total_price SET NOT NULL;

-- Update RLS policies to use order_id instead of id
DROP POLICY IF EXISTS "Users can view their own order items." ON order_items;
DROP POLICY IF EXISTS "Users can create their own order items." ON order_items;

CREATE POLICY "Users can view their own order items."
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.order_id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own order items."
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.order_id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Add policy to allow searching orders by order_number (for guest users)
CREATE POLICY "Anyone can search orders by order number."
  ON orders FOR SELECT
  USING (true);

-- Add policy to allow inserting orders with null user_id (for guest users)
CREATE POLICY "Anyone can create orders."
  ON orders FOR INSERT
  WITH CHECK (true); 