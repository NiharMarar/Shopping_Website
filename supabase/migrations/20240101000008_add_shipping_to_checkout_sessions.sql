-- Add shipping and tax columns to checkout_sessions table
ALTER TABLE checkout_sessions 
ADD COLUMN IF NOT EXISTS selected_shipping_rate jsonb,
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0.08,
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0; 