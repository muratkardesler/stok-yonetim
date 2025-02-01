-- First add customer_id column if it doesn't exist
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS customer_id UUID;

-- Then add the foreign key constraint
ALTER TABLE sales
ADD CONSTRAINT fk_sales_customer
FOREIGN KEY (customer_id) 
REFERENCES customers(id)
ON DELETE SET NULL;
