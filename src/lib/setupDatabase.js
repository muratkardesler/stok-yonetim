import { supabase } from './supabaseClient'

export const setupCustomersTable = async () => {
  try {
    // Müşteriler tablosunu oluştur
    const { error: createError } = await supabase.rpc('create_customers_table', {
      sql: `
        create table if not exists customers (
          id uuid default gen_random_uuid() primary key,
          name text not null,
          phone text,
          email text,
          address text,
          notes text,
          status text default 'active' check (status in ('active', 'passive')),
          total_purchases decimal(10,2) default 0,
          last_purchase_date timestamp with time zone,
          created_at timestamp with time zone default now(),
          updated_at timestamp with time zone default now()
        );

        -- Müşteri adı için index
        create index if not exists customers_name_idx on customers (name);

        -- Otomatik updated_at güncellemesi için trigger
        create or replace function update_updated_at_column()
        returns trigger as $$
        begin
            new.updated_at = now();
            return new;
        end;
        $$ language plpgsql;

        create trigger update_customers_updated_at
            before update on customers
            for each row
            execute function update_updated_at_column();
      `
    })

    if (createError) {
      console.error('Error creating customers table:', createError)
      return
    }

    console.log('Customers table created successfully')
  } catch (error) {
    console.error('Error in setupCustomersTable:', error)
  }
}

// Diğer tablo kurulum fonksiyonları buraya eklenebilir

export const setupDatabase = async () => {
  await setupCustomersTable()
  // Diğer tablo kurulum fonksiyonları buraya eklenebilir
} 