-- ============================================================================
-- Al-Mowan Hardware & Paints Storefront (الموان للحدايد والبويات ولوازم المعمار)
-- PostgreSQL Schema + Row Level Security (RLS) + Realtime + Storage (CDN Media)
-- Paste this file into Supabase Dashboard -> SQL Editor -> Run once.
-- ============================================================================

-- 1. Admin Registry Table
CREATE TABLE IF NOT EXISTS public.admins (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admins (email)
VALUES ('mnazih298@gmail.com'), ('mohamednazih240@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Authoritative Admin Verification Helper (checks verified email in auth.users)
CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND (
        lower(u.email) = 'mnazih298@gmail.com'
        OR EXISTS (
          SELECT 1
          FROM public.admins a
          WHERE lower(a.email) = lower(u.email)
        )
      )
  );
$$;

-- 2. Store Configuration
CREATE TABLE IF NOT EXISTS public.store_config (
  id text PRIMARY KEY,
  store_name text NOT NULL,
  header_brand_name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  announcement_bar text NOT NULL DEFAULT '',
  phone_primary text NOT NULL,
  phone_secondary text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL,
  working_hours text NOT NULL DEFAULT '',
  address text NOT NULL,
  shipping_fee numeric NOT NULL DEFAULT 50,
  free_shipping_min numeric NOT NULL DEFAULT 1000,
  facebook_url text NOT NULL DEFAULT '',
  maps_url text NOT NULL DEFAULT '',
  sections_title_categories text NOT NULL DEFAULT '',
  sections_subtitle_categories text NOT NULL DEFAULT '',
  sections_title_products text NOT NULL DEFAULT '',
  sections_title_brands text NOT NULL DEFAULT '',
  sections_subtitle_brands text NOT NULL DEFAULT '',
  contact_badge text NOT NULL DEFAULT '',
  contact_title text NOT NULL DEFAULT '',
  contact_description text NOT NULL DEFAULT '',
  footer_bio text NOT NULL DEFAULT '',
  visibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  brands jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Hero Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  action_type text NOT NULL DEFAULT 'none' CHECK (action_type IN ('none', 'whatsapp', 'category', 'color_studio')),
  action_target text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Categories & Subpages
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subpages (
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Products Catalog (indexed for fast sorting/filtering at high scale)
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price numeric NULL,
  old_price numeric NULL,
  stock integer NULL,
  available boolean NOT NULL DEFAULT true,
  unit text NOT NULL DEFAULT '',
  sizes text NOT NULL DEFAULT '',
  specs text NOT NULL DEFAULT '',
  badge text NOT NULL DEFAULT '',
  category_id text NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  subpage_id text NOT NULL DEFAULT '',
  brand_name text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_offer boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_offer ON public.products(is_offer) WHERE is_offer = true;

-- 6. Color Studio Catalogs (supports multiple images + multiple PDFs per item)
CREATE TABLE IF NOT EXISTS public.catalogs (
  id text PRIMARY KEY,
  title text NOT NULL,
  brand text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT 'image' CHECK (file_type IN ('pdf', 'image')),
  file_url text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Customer Orders & Inquiries (PII protected: public insert only, admin read/manage)
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  notes text NOT NULL DEFAULT '',
  payment_method text NOT NULL CHECK (payment_method IN ('cod', 'instapay', 'vodafone_cash')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  phone text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  color_code text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- 8. Privacy-First Lightweight Store Analytics (No IP, No PII, Ephemeral Session IDs)
CREATE TABLE IF NOT EXISTS public.store_analytics (
  id text PRIMARY KEY,
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (
    event_type IN ('store_visit', 'page_view', 'category_view', 'product_view', 'cart_add', 'whatsapp_click')
  ),
  target_id text NOT NULL DEFAULT '',
  target_label text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('mobile', 'desktop')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_analytics_created_at ON public.store_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_analytics_event_type ON public.store_analytics(event_type);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subpages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Storefront Catalog)
DROP POLICY IF EXISTS "Public read store_config" ON public.store_config;
CREATE POLICY "Public read store_config" ON public.store_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read banners" ON public.banners;
CREATE POLICY "Public read banners" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read subpages" ON public.subpages;
CREATE POLICY "Public read subpages" ON public.subpages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read catalogs" ON public.catalogs;
CREATE POLICY "Public read catalogs" ON public.catalogs FOR SELECT USING (true);

-- Admin Write Policies (Storefront Catalog)
DROP POLICY IF EXISTS "Admin write store_config" ON public.store_config;
CREATE POLICY "Admin write store_config" ON public.store_config
  FOR ALL USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin write banners" ON public.banners;
CREATE POLICY "Admin write banners" ON public.banners
  FOR ALL USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
CREATE POLICY "Admin write categories" ON public.categories
  FOR ALL USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin write subpages" ON public.subpages;
CREATE POLICY "Admin write subpages" ON public.subpages
  FOR ALL USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products" ON public.products
  FOR ALL USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin write catalogs" ON public.catalogs;
CREATE POLICY "Admin write catalogs" ON public.catalogs
  FOR ALL USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin manage admins" ON public.admins;
CREATE POLICY "Admin manage admins" ON public.admins
  FOR ALL USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

-- Orders & Inquiries (Public can create 'new' only; Admin can read/update/delete)
DROP POLICY IF EXISTS "Public create orders" ON public.orders;
CREATE POLICY "Public create orders" ON public.orders
  FOR INSERT WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" ON public.orders
  FOR SELECT USING (public.is_store_admin());

DROP POLICY IF EXISTS "Admin update delete orders" ON public.orders;
CREATE POLICY "Admin update delete orders" ON public.orders
  FOR UPDATE USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;
CREATE POLICY "Admin delete orders" ON public.orders
  FOR DELETE USING (public.is_store_admin());

DROP POLICY IF EXISTS "Public create inquiries" ON public.inquiries;
CREATE POLICY "Public create inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "Admin manage inquiries" ON public.inquiries;
CREATE POLICY "Admin manage inquiries" ON public.inquiries
  FOR SELECT USING (public.is_store_admin());

DROP POLICY IF EXISTS "Admin update inquiries" ON public.inquiries;
CREATE POLICY "Admin update inquiries" ON public.inquiries
  FOR UPDATE USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Admin delete inquiries" ON public.inquiries;
CREATE POLICY "Admin delete inquiries" ON public.inquiries
  FOR DELETE USING (public.is_store_admin());

-- Store Analytics (Public insert only; only Admin can read or clear)
DROP POLICY IF EXISTS "Public insert analytics" ON public.store_analytics;
CREATE POLICY "Public insert analytics" ON public.store_analytics
  FOR INSERT WITH CHECK (
    event_type IN ('store_visit', 'page_view', 'category_view', 'product_view', 'cart_add', 'whatsapp_click')
    AND device_type IN ('mobile', 'desktop')
  );

DROP POLICY IF EXISTS "Admin read analytics" ON public.store_analytics;
CREATE POLICY "Admin read analytics" ON public.store_analytics
  FOR SELECT USING (public.is_store_admin());

DROP POLICY IF EXISTS "Admin delete analytics" ON public.store_analytics;
CREATE POLICY "Admin delete analytics" ON public.store_analytics
  FOR DELETE USING (public.is_store_admin());

-- ============================================================================
-- Supabase Storage Bucket ('mowan-media') for Lightweight Device Uploads
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mowan-media',
  'mowan-media',
  true,
  15728640,
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 15728640,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

DROP POLICY IF EXISTS "Public view mowan-media" ON storage.objects;
CREATE POLICY "Public view mowan-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'mowan-media');

DROP POLICY IF EXISTS "Admin upload mowan-media" ON storage.objects;
CREATE POLICY "Admin upload mowan-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'mowan-media' AND public.is_store_admin());

DROP POLICY IF EXISTS "Admin update mowan-media" ON storage.objects;
CREATE POLICY "Admin update mowan-media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'mowan-media' AND public.is_store_admin())
  WITH CHECK (bucket_id = 'mowan-media' AND public.is_store_admin());

DROP POLICY IF EXISTS "Admin delete mowan-media" ON storage.objects;
CREATE POLICY "Admin delete mowan-media" ON storage.objects
  FOR DELETE USING (bucket_id = 'mowan-media' AND public.is_store_admin());

-- ============================================================================
-- Real-time Live Sync Publication (Instant updates across all devices)
-- ============================================================================
ALTER TABLE public.store_config REPLICA IDENTITY FULL;
ALTER TABLE public.banners REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.subpages REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.catalogs REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.inquiries REPLICA IDENTITY FULL;
ALTER TABLE public.store_analytics REPLICA IDENTITY FULL;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'store_config', 'banners', 'categories', 'subpages',
    'products', 'catalogs', 'orders', 'inquiries', 'store_analytics'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END $$;
