-- Add discount_rate column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5,2) DEFAULT 0;

-- Update existing records to have 0 discount rate
UPDATE packages SET discount_rate = 0 WHERE discount_rate IS NULL; 