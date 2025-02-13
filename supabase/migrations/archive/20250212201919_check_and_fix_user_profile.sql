-- Önce mevcut durumu kontrol edelim ve düzeltelim
DO $$
DECLARE
    user_id uuid;
    profile_exists boolean;
    company_exists boolean;
    user_exists boolean;
BEGIN
    -- Kullanıcı ID'sini alalım
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'kardeslermurat257@gmail.com';

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Kullanıcı bulunamadı';
    END IF;

    -- Profile tablosunu kontrol edelim
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = user_id
    ) INTO profile_exists;

    -- Companies tablosunu kontrol edelim
    SELECT EXISTS (
        SELECT 1 FROM public.companies WHERE auth_users_id = user_id
    ) INTO company_exists;

    -- Users tablosunu kontrol edelim
    SELECT EXISTS (
        SELECT 1 FROM public.users WHERE id = user_id
    ) INTO user_exists;

    -- Eğer profile yoksa oluşturalım
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id,
            first_name,
            last_name,
            created_at,
            updated_at,
            trial_end_date,
            is_active,
            role,
            settings
        ) VALUES (
            user_id,
            '',
            '',
            now(),
            now(),
            now() + interval '14 days',
            true,
            'company_owner',
            '{}'::jsonb
        );
    ELSE
        -- Profile varsa aktif hale getirelim
        UPDATE public.profiles
        SET is_active = true,
            trial_end_date = now() + interval '14 days'
        WHERE id = user_id;
    END IF;

    -- Eğer company yoksa oluşturalım
    IF NOT company_exists THEN
        INSERT INTO public.companies (
            name,
            email,
            is_active,
            created_at,
            updated_at,
            auth_users_id
        ) VALUES (
            'Default Company',
            'kardeslermurat257@gmail.com',
            true,
            now(),
            now(),
            user_id
        );
    END IF;

    -- Eğer user yoksa oluşturalım
    IF NOT user_exists THEN
        INSERT INTO public.users (
            id,
            first_name,
            last_name,
            role,
            is_active,
            created_at,
            updated_at,
            company_id
        ) VALUES (
            user_id,
            '',
            '',
            'company_owner',
            true,
            now(),
            now(),
            (SELECT id FROM public.companies WHERE auth_users_id = user_id)
        );
    END IF;

END $$;

