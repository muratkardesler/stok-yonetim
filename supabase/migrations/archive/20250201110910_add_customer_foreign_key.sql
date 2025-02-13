-- First add customer_id column if it doesn't exist
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS customer_id UUID;

-- Then add the foreign key constraint
ALTER TABLE sales
ADD CONSTRAINT fk_sales_customer
FOREIGN KEY (customer_id) 
REFERENCES customers(id)
ON DELETE SET NULL;

-- E-posta kontrolü için fonksiyon
create or replace function check_email_exists(email_to_check text)
returns boolean
security definer
set search_path = public
language plpgsql
as $$
declare
  user_exists boolean;
begin
  select exists (
    select 1
    from auth.users
    where email = email_to_check
  ) into user_exists;
  
  return user_exists;
end;
$$;

-- Fonksiyona public erişim izni
grant execute on function check_email_exists(text) to anon, authenticated;
