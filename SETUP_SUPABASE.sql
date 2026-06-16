-- =====================================================
-- SETUP SUPABASE — Execute no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA: categories
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  emoji      text,
  created_at timestamptz DEFAULT now()
);

-- 2. TABELA: products
CREATE TABLE IF NOT EXISTS public.products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  description       text,
  short_description text,
  price             numeric(10,2) NOT NULL DEFAULT 0,
  price_from        numeric(10,2),
  stock             integer NOT NULL DEFAULT 0,
  sku               text,
  category_id       uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory       text,
  brand             text,
  status            text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  featured          boolean NOT NULL DEFAULT false,
  images            text[] DEFAULT '{}',
  sizes             text[] DEFAULT '{}',
  colors            text[] DEFAULT '{}',
  mercadolivre_url  text,
  shopee_url        text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- 3. TABELA: customers
CREATE TABLE IF NOT EXISTS public.customers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text UNIQUE NOT NULL,
  email      text,
  created_at timestamptz DEFAULT now()
);

-- 4. TABELA: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone         text NOT NULL,
  zipcode       text,
  address       text,
  number        text,
  complement    text,
  delivery_type text DEFAULT 'entrega',
  items         jsonb NOT NULL DEFAULT '[]',
  total         numeric(10,2) NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','separacao','enviado','entregue','cancelado')),
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;

-- Leitura pública dos produtos ativos e categorias (loja)
CREATE POLICY "public_read_active_products" ON public.products
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "public_read_categories" ON public.categories
  FOR SELECT USING (true);

-- Admin (autenticado) pode fazer tudo
CREATE POLICY "admin_all_products" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_categories" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_customers" ON public.customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_orders" ON public.orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inserção pública de pedidos (clientes fazem checkout sem login)
CREATE POLICY "public_insert_orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_upsert_customers" ON public.customers
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- STORAGE — Bucket para imagens de produtos
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política: qualquer um pode ler imagens
CREATE POLICY "public_read_product_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Política: admin pode fazer upload/delete
CREATE POLICY "admin_upload_product_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');

CREATE POLICY "admin_delete_product_images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'products');

-- =====================================================
-- DADOS INICIAIS (opcional)
-- =====================================================

INSERT INTO public.categories (name, slug, emoji) VALUES
  ('Camisetas',   'camisetas',   '👕'),
  ('Calças',      'calcas',      '👖'),
  ('Tênis',       'tenis',       '👟'),
  ('Acessórios',  'acessorios',  '⌚'),
  ('Relógios',    'relogios',    '🕐'),
  ('Eletrônicos', 'eletronicos', '📱')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- COMO CONFIGURAR:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script
-- 4. Vá em Authentication > Users > Add User
--    para criar o usuário admin do painel
-- 5. No arquivo .env, coloque a chave CORRETA:
--    Settings > API > Project API keys > "anon public"
--    (começa com eyJ...)
-- =====================================================
