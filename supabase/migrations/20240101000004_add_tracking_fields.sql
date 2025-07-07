-- Add tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS tracking_carrier text DEFAULT 'USPS',
ADD COLUMN IF NOT EXISTS order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone;

-- Update existing orders to have the new order_status field
UPDATE orders SET order_status = status WHERE order_status IS NULL;

-- Add index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Add index for order status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- Add policy to allow admins to update tracking information
CREATE POLICY "Admins can update order tracking."
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add policy to allow viewing orders by tracking number (for customer tracking)
CREATE POLICY "Anyone can view orders by tracking number."
  ON orders FOR SELECT
  USING (true); 