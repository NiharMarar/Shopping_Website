-- Add dimension fields to products table for shipping calculations
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS length decimal(10,2),
ADD COLUMN IF NOT EXISTS width decimal(10,2),
ADD COLUMN IF NOT EXISTS height decimal(10,2),
ADD COLUMN IF NOT EXISTS weight decimal(10,2);

-- Set default values for existing products if they don't have dimensions
UPDATE products SET 
  length = 12,
  width = 8,
  height = 6,
  weight = 16
WHERE length IS NULL OR width IS NULL OR height IS NULL OR weight IS NULL;

-- Add comments to document the units
COMMENT ON COLUMN products.length IS 'Length in inches';
COMMENT ON COLUMN products.width IS 'Width in inches';
COMMENT ON COLUMN products.height IS 'Height in inches';
COMMENT ON COLUMN products.weight IS 'Weight in ounces'; 