-- Update order_status constraint to include all tracking statuses
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_order_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_order_status_check 
CHECK (order_status IN ('pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')); 