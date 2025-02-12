

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."sale_status" AS ENUM (
    'pending',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."sale_status" OWNER TO "postgres";


CREATE TYPE "public"."sale_type" AS ENUM (
    'product',
    'package'
);


ALTER TYPE "public"."sale_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'company_owner',
    'company_user'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_email_exists"("email_to_check" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- users tablosunda e-posta kontrolü (auth.users ile join yaparak)
    RETURN EXISTS (
        SELECT 1 
        FROM users u
        JOIN auth.users au ON u.id = au.id
        WHERE au.email = email_to_check
        AND u.is_active = true
    );
END;
$$;


ALTER FUNCTION "public"."check_email_exists"("email_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_incomplete_users"("email_to_check" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- auth.users tablosundan, users tablosunda olmayan ve verilen e-postaya sahip kayıtları sil
  delete from auth.users au
  where au.email = email_to_check
  and not exists (
    select 1 from users u where u.id = au.id
  );
end;
$$;


ALTER FUNCTION "public"."cleanup_incomplete_users"("email_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_user_registration"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_company_id integer;
BEGIN
    -- Şirket kaydı oluştur
    INSERT INTO companies (
        name, 
        email, 
        phone, 
        address, 
        created_at,
        is_active
    ) VALUES (
        company_name,
        company_email,
        company_phone,
        company_address,
        now(),
        true
    ) RETURNING id INTO new_company_id;

    -- Kullanıcı kaydını güncelle
    UPDATE public.users
    SET company_id = new_company_id
    WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."complete_user_registration"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_profile"("user_id" "uuid") RETURNS TABLE("id" "uuid", "first_name" "text", "last_name" "text", "is_active" boolean, "trial_end_date" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.is_active,
        p.trial_end_date
    FROM profiles p
    WHERE p.id = user_id
    LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_active_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    company_id_var uuid;
BEGIN
    -- Önce company kaydı oluştur
    INSERT INTO public.companies (
        name,
        email,
        phone,
        address,
        is_active,
        created_at,
        updated_at,
        auth_users_id
    ) VALUES (
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'company_email',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'address',
        true,
        now(),
        now(),
        NEW.id
    ) RETURNING id INTO company_id_var;

    -- Profiles tablosuna ekle
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        company_name,
        company_email,
        phone,
        address,
        created_at,
        updated_at,
        trial_end_date,
        is_active,
        role
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'company_email',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'address',
        now(),
        now(),
        now() + interval '14 days',
        true,
        'company_owner'
    );

    -- Users tablosuna ekle
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
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        'company_owner',
        true,
        now(),
        now(),
        company_id_var
    );

    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user for user_id: %', NEW.id;
        RAISE LOG 'Error message: %', SQLERRM;
        RAISE LOG 'Error detail: %', SQLSTATE;
        RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_email_exists"("p_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_exists boolean;
begin
  select exists(
    select 1 
    from auth.users 
    where email ilike p_email
  ) into user_exists;
  
  return user_exists;
end;
$$;


ALTER FUNCTION "public"."is_email_exists"("p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_product_images"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Ürün eklendiğinde veya güncellendiğinde, aynı isme sahip resimleri eşleştir
  update public.product_images
  set status = 'matched'
  where product_name = NEW.name;
  
  return NEW;
end;
$$;


ALTER FUNCTION "public"."match_product_images"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_sale_user_id"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_sale_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_company_info"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_company_id integer;
BEGIN
    -- Önce şirket kaydı oluştur
    INSERT INTO companies (name, email, phone, address, created_at)
    VALUES (company_name, company_email, company_phone, company_address, now())
    RETURNING id INTO new_company_id;

    -- Kullanıcı kaydını güncelle
    UPDATE public.users
    SET company_id = new_company_id
    WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."update_company_info"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_primary_image"("p_product_name" "text", "p_image_url" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update products
  set primary_image = p_image_url
  where name = p_product_name;
end;
$$;


ALTER FUNCTION "public"."update_product_primary_image"("p_product_name" "text", "p_image_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "parent_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "address" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."companies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."companies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."companies_id_seq" OWNED BY "public"."companies"."id";



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "status" "text" DEFAULT 'active'::"text",
    "total_purchases" numeric(10,2) DEFAULT 0,
    "last_purchase_date" timestamp with time zone
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."package_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "package_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."package_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."packages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "user_id" "uuid" NOT NULL,
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "discount_rate" numeric(5,2) DEFAULT 0
);


ALTER TABLE "public"."packages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_name" "text" NOT NULL,
    "description" "text",
    "image_url" "text" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "status" "text" DEFAULT 'unmatched'::"text",
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "product_id" "uuid"
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stock" integer DEFAULT 0 NOT NULL,
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "company_name" "text",
    "company_email" "text",
    "phone" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "trial_end_date" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "last_login_ip" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "role" "text" DEFAULT 'user'::"text",
    "totp_secret" "text",
    "requires_2fa" boolean DEFAULT false
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles_backup" (
    "id" "uuid",
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text"
);


ALTER TABLE "public"."profiles_backup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sale_details" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sale_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "package_id" "uuid",
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "sale_details_check" CHECK (((("product_id" IS NOT NULL) AND ("package_id" IS NULL)) OR (("package_id" IS NOT NULL) AND ("product_id" IS NULL))))
);


ALTER TABLE "public"."sale_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sale_details_extra" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sale_id" "uuid",
    "customer_name" "text",
    "tax_rate" integer,
    "discount_rate" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sale_details_extra" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sale_type" "public"."sale_type" NOT NULL,
    "status" "public"."sale_status" DEFAULT 'pending'::"public"."sale_status" NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "tax_rate" integer,
    "discount_rate" integer,
    "customer_id" "uuid"
);


ALTER TABLE "public"."sales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" bigint DEFAULT 1 NOT NULL,
    "settings" "jsonb" DEFAULT "jsonb_build_object"('defaultTrialDays', 30, 'autoRenewLicense', false, 'emailNotifications', "jsonb_build_object"('newUser', true, 'licenseExpiry', true, 'systemAlerts', true), 'notificationEmail', '', 'require2FA', false, 'sessionTimeout', 60, 'maxLoginAttempts', 5, 'autoBackup', true, 'backupTime', '02:00', 'backupRetentionDays', 30) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test" (
    "id" integer NOT NULL,
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."test" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."test_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."test_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."test_id_seq" OWNED BY "public"."test"."id";



CREATE TABLE IF NOT EXISTS "public"."user_activities" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "action" character varying(50) NOT NULL,
    "details" "text",
    "ip_address" character varying(45),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."user_activities" OWNER TO "postgres";


ALTER TABLE "public"."user_activities" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_activities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "ip_address" "text",
    "login_date" timestamp with time zone DEFAULT "now"(),
    "device_info" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "company_id" integer,
    "first_name" "text",
    "last_name" "text",
    "role" "public"."user_role" DEFAULT 'company_user'::"public"."user_role" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."companies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."companies_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."test" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."test_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_user_id_parent_id_key" UNIQUE ("name", "user_id", "parent_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."package_products"
    ADD CONSTRAINT "package_products_package_id_product_id_key" UNIQUE ("package_id", "product_id");



ALTER TABLE ONLY "public"."package_products"
    ADD CONSTRAINT "package_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packages"
    ADD CONSTRAINT "packages_name_user_id_key" UNIQUE ("name", "user_id");



ALTER TABLE ONLY "public"."packages"
    ADD CONSTRAINT "packages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_name_category_id_user_id_key" UNIQUE ("name", "category_id", "user_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sale_details_extra"
    ADD CONSTRAINT "sale_details_extra_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sale_details"
    ADD CONSTRAINT "sale_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test"
    ADD CONSTRAINT "test_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "customers_name_idx" ON "public"."customers" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_user_activities_created_at" ON "public"."user_activities" USING "btree" ("created_at");



CREATE INDEX "idx_user_activities_user_id" ON "public"."user_activities" USING "btree" ("user_id");



CREATE INDEX "sale_details_extra_sale_id_idx" ON "public"."sale_details_extra" USING "btree" ("sale_id");



CREATE OR REPLACE TRIGGER "match_images_on_product_change" AFTER INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."match_product_images"();



CREATE OR REPLACE TRIGGER "set_sale_user_id_trigger" BEFORE INSERT ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."set_sale_user_id"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."product_images" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_categories_updated_at" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_package_products_updated_at" BEFORE UPDATE ON "public"."package_products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_packages_updated_at" BEFORE UPDATE ON "public"."packages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sale_details_updated_at" BEFORE UPDATE ON "public"."sale_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sales_updated_at" BEFORE UPDATE ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "fk_sales_customer" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."package_products"
    ADD CONSTRAINT "package_products_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id");



ALTER TABLE ONLY "public"."package_products"
    ADD CONSTRAINT "package_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."packages"
    ADD CONSTRAINT "packages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sale_details_extra"
    ADD CONSTRAINT "sale_details_extra_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sale_details"
    ADD CONSTRAINT "sale_details_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id");



ALTER TABLE ONLY "public"."sale_details"
    ADD CONSTRAINT "sale_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."sale_details"
    ADD CONSTRAINT "sale_details_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Activities are viewable by admin users" ON "public"."user_activities" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "admin"
  WHERE (("admin"."id" = "auth"."uid"()) AND ("admin"."role" = 'admin'::"text")))));



CREATE POLICY "Companies are insertable by authenticated users" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Companies are updatable by admin or company owner" ON "public"."companies" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role" = 'admin'::"public"."user_role") OR (("users"."role" = 'company_owner'::"public"."user_role") AND ("users"."company_id" = "companies"."id")))))));



CREATE POLICY "Companies are viewable by authenticated users" ON "public"."companies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Customers are insertable by authenticated users" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Customers are updatable by authenticated users" ON "public"."customers" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Customers are viewable by authenticated users" ON "public"."customers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable all for companies" ON "public"."companies" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all operations for authenticated users" ON "public"."sale_details" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all operations for authenticated users" ON "public"."sales" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."test" FOR SELECT USING (true);



CREATE POLICY "Kullanıcılar sadece kendi satış detaylarını ekleyebilir" ON "public"."sale_details" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Kullanıcılar sadece kendi satış detaylarını görebilir" ON "public"."sale_details" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Kullanıcılar sadece kendi satış ekstra detaylarını ekleye" ON "public"."sale_details_extra" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details_extra"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Kullanıcılar sadece kendi satış ekstra detaylarını göreb" ON "public"."sale_details_extra" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details_extra"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Kullanıcılar sadece kendi satışlarını ekleyebilir" ON "public"."sales" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar sadece kendi satışlarını görebilir" ON "public"."sales" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar sadece kendi satışlarını güncelleyebilir" ON "public"."sales" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar sadece kendi satışlarını silebilir" ON "public"."sales" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Package products are deletable by package owner" ON "public"."package_products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."packages"
  WHERE (("packages"."id" = "package_products"."package_id") AND ("packages"."user_id" = "auth"."uid"())))));



CREATE POLICY "Package products are insertable by authenticated users" ON "public"."package_products" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Package products are updatable by package owner" ON "public"."package_products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."packages"
  WHERE (("packages"."id" = "package_products"."package_id") AND ("packages"."user_id" = "auth"."uid"())))));



CREATE POLICY "Package products are viewable by authenticated users" ON "public"."package_products" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Profiles are viewable by users" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Sale details extra are insertable by authenticated users" ON "public"."sale_details_extra" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Sale details extra are updatable by authenticated users" ON "public"."sale_details_extra" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Sale details extra are viewable by authenticated users" ON "public"."sale_details_extra" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users are insertable by authenticated users" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users are viewable by company members" ON "public"."users" FOR SELECT TO "authenticated" USING ((("company_id" IN ( SELECT "users_1"."company_id"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "users_1"
  WHERE (("users_1"."id" = "auth"."uid"()) AND ("users_1"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can delete their own categories" ON "public"."categories" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own images" ON "public"."product_images" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own package products" ON "public"."package_products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."packages"
  WHERE (("packages"."id" = "package_products"."package_id") AND ("packages"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own packages" ON "public"."packages" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own products" ON "public"."products" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own sale details" ON "public"."sale_details" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own sales" ON "public"."sales" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own categories" ON "public"."categories" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own images" ON "public"."product_images" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own package products" ON "public"."package_products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."packages"
  WHERE (("packages"."id" = "package_products"."package_id") AND ("packages"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own packages" ON "public"."packages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own products" ON "public"."products" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own sale details" ON "public"."sale_details" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own sales" ON "public"."sales" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own sessions" ON "public"."user_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can update their own categories" ON "public"."categories" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own images" ON "public"."product_images" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own package products" ON "public"."package_products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."packages"
  WHERE (("packages"."id" = "package_products"."package_id") AND ("packages"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own packages" ON "public"."packages" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own products" ON "public"."products" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own sale details" ON "public"."sale_details" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own sales" ON "public"."sales" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own sessions" ON "public"."user_sessions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view all images" ON "public"."product_images" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view their own categories" ON "public"."categories" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own package products" ON "public"."package_products" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."packages"
  WHERE (("packages"."id" = "package_products"."package_id") AND ("packages"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own packages" ON "public"."packages" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own products" ON "public"."products" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own sale details" ON "public"."sale_details" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."sales"
  WHERE (("sales"."id" = "sale_details"."sale_id") AND ("sales"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own sales" ON "public"."sales" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own sessions" ON "public"."user_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "admin_all" ON "public"."user_activities" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."package_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."packages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sale_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sale_details_extra" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_select" ON "public"."user_activities" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."cleanup_incomplete_users"("email_to_check" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."cleanup_incomplete_users"("email_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_incomplete_users"("email_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_incomplete_users"("email_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_user_registration"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_user_registration"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_user_registration"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_email_exists"("p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_email_exists"("p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_email_exists"("p_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_product_images"() TO "anon";
GRANT ALL ON FUNCTION "public"."match_product_images"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_product_images"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_sale_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_sale_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_sale_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_company_info"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_company_info"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_company_info"("user_id" "uuid", "company_name" "text", "company_email" "text", "company_phone" "text", "company_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_primary_image"("p_product_name" "text", "p_image_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_primary_image"("p_product_name" "text", "p_image_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_primary_image"("p_product_name" "text", "p_image_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."package_products" TO "anon";
GRANT ALL ON TABLE "public"."package_products" TO "authenticated";
GRANT ALL ON TABLE "public"."package_products" TO "service_role";



GRANT ALL ON TABLE "public"."packages" TO "anon";
GRANT ALL ON TABLE "public"."packages" TO "authenticated";
GRANT ALL ON TABLE "public"."packages" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles_backup" TO "anon";
GRANT ALL ON TABLE "public"."profiles_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_backup" TO "service_role";



GRANT ALL ON TABLE "public"."sale_details" TO "anon";
GRANT ALL ON TABLE "public"."sale_details" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_details" TO "service_role";



GRANT ALL ON TABLE "public"."sale_details_extra" TO "anon";
GRANT ALL ON TABLE "public"."sale_details_extra" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_details_extra" TO "service_role";



GRANT ALL ON TABLE "public"."sales" TO "anon";
GRANT ALL ON TABLE "public"."sales" TO "authenticated";
GRANT ALL ON TABLE "public"."sales" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."test" TO "anon";
GRANT ALL ON TABLE "public"."test" TO "authenticated";
GRANT ALL ON TABLE "public"."test" TO "service_role";



GRANT ALL ON SEQUENCE "public"."test_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."test_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."test_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_activities" TO "anon";
GRANT ALL ON TABLE "public"."user_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_activities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_activities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_activities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
