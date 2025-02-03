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
create or replace function public.is_email_exists(p_email text)
returns table (exists boolean) 
security definer 
set search_path = public
language plpgsql
as $$
begin
  return query
  select count(*) > 0 as exists
  from auth.users
  where email = p_email;
end;
$$;

-- Fonksiyona public erişim izni
grant execute on function public.is_email_exists(text) to anon, authenticated;
