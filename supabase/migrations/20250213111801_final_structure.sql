-- Önce tüm tabloları temizle
DROP TABLE IF EXISTS public.sale_details CASCADE;
DROP TABLE IF EXISTS public.sale_details_extra CASCADE;
DROP TABLE IF EXISTS public.package_products CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Önce companies tablosunu oluştur
CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Sonra profiles tablosunu oluştur
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    trial_end_date timestamp with time zone DEFAULT (now() + interval '14 days'),
    is_active boolean DEFAULT true,
    role text DEFAULT 'company_owner',
    settings jsonb DEFAULT '{}'::jsonb,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Users tablosunu oluştur
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    role text DEFAULT 'company_owner',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Diğer tabloları oluştur
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    parent_id uuid REFERENCES public.categories(id),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price decimal(10,2) DEFAULT 0,
    stock integer DEFAULT 0,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    url text NOT NULL,
    is_primary boolean DEFAULT false,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price decimal(10,2) DEFAULT 0,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.package_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer DEFAULT 1,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    total_amount decimal(10,2) DEFAULT 0,
    status text DEFAULT 'pending',
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.sale_details (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    quantity integer DEFAULT 1,
    price decimal(10,2) DEFAULT 0,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.sale_details_extra (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE,
    notes text,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Kullanıcı aktiflik kontrolü için fonksiyon
CREATE OR REPLACE FUNCTION public.check_user_active(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_active boolean;
    v_profile_exists boolean;
BEGIN
    -- Debug log
    RAISE LOG 'Checking active status for user: %', user_id;

    -- Önce profilin var olup olmadığını kontrol et
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = user_id
    ) INTO v_profile_exists;

    -- Debug log
    RAISE LOG 'Profile exists: %', v_profile_exists;

    IF NOT v_profile_exists THEN
        RAISE LOG 'Profile not found for user: %', user_id;
        RETURN false;
    END IF;

    -- Aktiflik durumunu kontrol et
    SELECT 
        CASE 
            WHEN p.is_active = true AND c.is_active = true THEN true 
            ELSE false 
        END
    INTO v_is_active
    FROM profiles p
    JOIN companies c ON c.id = p.company_id
    WHERE p.id = user_id;

    -- Debug log
    RAISE LOG 'User active status: %', v_is_active;

    RETURN COALESCE(v_is_active, false);
END;
$$;

-- get_active_profile fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION public.get_active_profile(user_id uuid)
RETURNS TABLE (
    id uuid,
    first_name text,
    last_name text,
    is_active boolean,
    role text,
    company_id uuid,
    company_name text,
    company_is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Debug log
    RAISE LOG 'Getting profile for user: %', user_id;

    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.is_active AND c.is_active as is_active,
        p.role,
        p.company_id,
        c.name as company_name,
        c.is_active as company_is_active
    FROM profiles p
    JOIN companies c ON c.id = p.company_id
    WHERE p.id = user_id;

    -- Debug log
    IF NOT FOUND THEN
        RAISE LOG 'No profile found for user: %', user_id;
    END IF;
END;
$$;

-- Yeni kullanıcı oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company_id uuid;
    v_company_name text;
BEGIN
    -- Debug log
    RAISE LOG 'Creating new user with email: %', NEW.email;

    -- Şirket adını belirle
    v_company_name := COALESCE(
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
        NEW.email
    );

    -- Debug log
    RAISE LOG 'Company name determined as: %', v_company_name;

    -- Önce company oluştur
    INSERT INTO public.companies (
        name,
        email,
        is_active
    ) VALUES (
        v_company_name,
        NEW.email,
        true
    ) RETURNING id INTO v_company_id;

    -- Debug log
    RAISE LOG 'Created company with ID: %', v_company_id;

    -- Sonra profile oluştur
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        is_active,
        role,
        company_id,
        trial_end_date
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        true,
        'company_owner',
        v_company_id,
        (now() + interval '14 days')
    );

    -- Debug log
    RAISE LOG 'Created profile for user ID: %', NEW.id;

    -- Son olarak users tablosuna ekle
    INSERT INTO public.users (
        id,
        first_name,
        last_name,
        role,
        is_active,
        company_id
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'company_owner',
        true,
        v_company_id
    );

    -- Debug log
    RAISE LOG 'Created user record for ID: %', NEW.id;

    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Hata durumunda detaylı log
        RAISE LOG 'Error in handle_new_user for email %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS politikalarını ayarla
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_details_extra ENABLE ROW LEVEL SECURITY;

-- Fonksiyonlara erişim izni ver
GRANT EXECUTE ON FUNCTION public.check_user_active TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO service_role;

-- Tablolara erişim izni ver
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.packages TO authenticated;
GRANT ALL ON public.package_products TO authenticated;
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.sales TO authenticated;
GRANT ALL ON public.sale_details TO authenticated;
GRANT ALL ON public.sale_details_extra TO authenticated;

-- RLS Policies
CREATE POLICY "Users can view their own company" ON public.companies
    FOR ALL USING (
        id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can view their own user data" ON public.users
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can manage their company's categories" ON public.categories
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's products" ON public.products
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's product images" ON public.product_images
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's packages" ON public.packages
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's package products" ON public.package_products
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's customers" ON public.customers
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's sales" ON public.sales
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's sale details" ON public.sale_details
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their company's sale details extra" ON public.sale_details_extra
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

