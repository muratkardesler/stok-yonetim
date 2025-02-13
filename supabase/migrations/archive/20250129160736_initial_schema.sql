-- Create and Enable RLS for profiles
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    updated_at timestamp with time zone,
    username text unique,
    full_name text,
    avatar_url text,
    website text,
    constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
    for select using (true);

create policy "Users can insert their own profile." on public.profiles
    for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
    for update using (auth.uid() = id);

-- Categories tablosu
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    parent_id uuid references public.categories(id),
    user_id uuid references auth.users(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(name, user_id, parent_id)
);

-- Categories için RLS politikaları
alter table public.categories enable row level security;
create policy "Users can view their own categories" on public.categories
    for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on public.categories
    for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on public.categories
    for update using (auth.uid() = user_id);
create policy "Users can delete their own categories" on public.categories
    for delete using (auth.uid() = user_id);

-- Products tablosu
create table public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    category_id uuid references public.categories(id) not null,
    user_id uuid references auth.users(id) not null,
    stock integer not null default 0,
    price decimal(10,2) not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(name, category_id, user_id)
);

-- Products için RLS politikaları
alter table public.products enable row level security;
create policy "Users can view their own products" on public.products
    for select using (auth.uid() = user_id);
create policy "Users can insert their own products" on public.products
    for insert with check (auth.uid() = user_id);
create policy "Users can update their own products" on public.products
    for update using (auth.uid() = user_id);
create policy "Users can delete their own products" on public.products
    for delete using (auth.uid() = user_id);

-- Packages tablosu
create table public.packages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    user_id uuid references auth.users(id) not null,
    price decimal(10,2) not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(name, user_id)
);

-- Packages için RLS politikaları
alter table public.packages enable row level security;
create policy "Users can view their own packages" on public.packages
    for select using (auth.uid() = user_id);
create policy "Users can insert their own packages" on public.packages
    for insert with check (auth.uid() = user_id);
create policy "Users can update their own packages" on public.packages
    for update using (auth.uid() = user_id);
create policy "Users can delete their own packages" on public.packages
    for delete using (auth.uid() = user_id);

-- Package Products tablosu
create table public.package_products (
    id uuid default gen_random_uuid() primary key,
    package_id uuid references public.packages(id) not null,
    product_id uuid references public.products(id) not null,
    quantity integer not null default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(package_id, product_id)
);

-- Package Products için RLS politikaları
alter table public.package_products enable row level security;
create policy "Users can view their own package products" on public.package_products
    for select using (
        exists (
            select 1 from public.packages
            where id = package_products.package_id
            and user_id = auth.uid()
        )
    );
create policy "Users can insert their own package products" on public.package_products
    for insert with check (
        exists (
            select 1 from public.packages
            where id = package_products.package_id
            and user_id = auth.uid()
        )
    );
create policy "Users can update their own package products" on public.package_products
    for update using (
        exists (
            select 1 from public.packages
            where id = package_products.package_id
            and user_id = auth.uid()
        )
    );
create policy "Users can delete their own package products" on public.package_products
    for delete using (
        exists (
            select 1 from public.packages
            where id = package_products.package_id
            and user_id = auth.uid()
        )
    );

-- Sales tablosu için enum tipleri
create type sale_type as enum ('product', 'package');
create type sale_status as enum ('pending', 'completed', 'cancelled');

-- Sales tablosu
create table public.sales (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    sale_type sale_type not null,
    status sale_status not null default 'pending',
    total_amount decimal(10,2) not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sales için RLS politikaları
alter table public.sales enable row level security;
create policy "Users can view their own sales" on public.sales
    for select using (auth.uid() = user_id);
create policy "Users can insert their own sales" on public.sales
    for insert with check (auth.uid() = user_id);
create policy "Users can update their own sales" on public.sales
    for update using (auth.uid() = user_id);
create policy "Users can delete their own sales" on public.sales
    for delete using (auth.uid() = user_id);

-- Sale Details tablosu
create table public.sale_details (
    id uuid default gen_random_uuid() primary key,
    sale_id uuid references public.sales(id) not null,
    product_id uuid references public.products(id),
    package_id uuid references public.packages(id),
    quantity integer not null default 1,
    unit_price decimal(10,2) not null default 0,
    total_price decimal(10,2) not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    check (
        (product_id is not null and package_id is null) or
        (package_id is not null and product_id is null)
    )
);

-- Sale Details için RLS politikaları
alter table public.sale_details enable row level security;
create policy "Users can view their own sale details" on public.sale_details
    for select using (
        exists (
            select 1 from public.sales
            where id = sale_details.sale_id
            and user_id = auth.uid()
        )
    );
create policy "Users can insert their own sale details" on public.sale_details
    for insert with check (
        exists (
            select 1 from public.sales
            where id = sale_details.sale_id
            and user_id = auth.uid()
        )
    );
create policy "Users can update their own sale details" on public.sale_details
    for update using (
        exists (
            select 1 from public.sales
            where id = sale_details.sale_id
            and user_id = auth.uid()
        )
    );
create policy "Users can delete their own sale details" on public.sale_details
    for delete using (
        exists (
            select 1 from public.sales
            where id = sale_details.sale_id
            and user_id = auth.uid()
        )
    );

-- Triggers for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_categories_updated_at
    before update on public.categories
    for each row
    execute function update_updated_at_column();

create trigger update_products_updated_at
    before update on public.products
    for each row
    execute function update_updated_at_column();

create trigger update_packages_updated_at
    before update on public.packages
    for each row
    execute function update_updated_at_column();

create trigger update_package_products_updated_at
    before update on public.package_products
    for each row
    execute function update_updated_at_column();

create trigger update_sales_updated_at
    before update on public.sales
    for each row
    execute function update_updated_at_column();

create trigger update_sale_details_updated_at
    before update on public.sale_details
    for each row
    execute function update_updated_at_column();
