-- ============================================================
-- SCHEMA SUPABASE - Loja Premium
-- Execute este SQL no painel do Supabase (SQL Editor)
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════════
-- TABELAS
-- ════════════════════════════════════════════

-- CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_from NUMERIC(10,2),
  stock INTEGER DEFAULT 0,
  sku TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  brand TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  featured BOOLEAN DEFAULT FALSE,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  mercadolivre_url TEXT,
  shopee_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- CLIENTES
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_order TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT,
  zipcode TEXT,
  address TEXT,
  number TEXT,
  complement TEXT,
  delivery_type TEXT DEFAULT 'entrega' CHECK (delivery_type IN ('entrega','retirada')),
  items JSONB DEFAULT '[]',
  total NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','separacao','enviado','entregue','cancelado')),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONFIGURAÇÕES DA LOJA
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT DEFAULT 'Minha Loja',
  slogan TEXT DEFAULT 'Os melhores produtos.',
  whatsapp TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  address TEXT DEFAULT '',
  email TEXT DEFAULT '',
  mercadolivre_url TEXT DEFAULT '',
  shopee_url TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (name, slug, emoji) VALUES
  ('Camisetas', 'camisetas', '👕'),
  ('Calças', 'calcas', '👖'),
  ('Tênis', 'tenis', '👟'),
  ('Jaquetas', 'jaquetas', '🧥'),
  ('Acessórios', 'acessorios', '🎒'),
  ('Relógios', 'relogios', '⌚'),
  ('Eletrônicos', 'eletronicos', '🎧'),
  ('Cosméticos', 'cosmeticos', '💄')
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════
-- STORAGE BUCKET
-- Execute no SQL Editor do Supabase
-- ════════════════════════════════════════════

-- Criar bucket público para imagens dos produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas antes de criar novas
DROP POLICY IF EXISTS "public_read_products" ON products;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
DROP POLICY IF EXISTS "public_read_settings" ON store_settings;
DROP POLICY IF EXISTS "auth_all_products" ON products;
DROP POLICY IF EXISTS "auth_all_categories" ON categories;
DROP POLICY IF EXISTS "auth_all_orders" ON orders;
DROP POLICY IF EXISTS "auth_all_customers" ON customers;
DROP POLICY IF EXISTS "auth_all_settings" ON store_settings;
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
DROP POLICY IF EXISTS "public_insert_customers" ON customers;
DROP POLICY IF EXISTS "public_update_customers" ON customers;

-- Leitura pública (loja)
CREATE POLICY "public_read_products" ON products FOR SELECT USING (status = 'ativo');
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "public_read_settings" ON store_settings FOR SELECT USING (TRUE);

-- Admin (usuários autenticados) — acesso total
CREATE POLICY "auth_all_products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_settings" ON store_settings FOR ALL USING (auth.role() = 'authenticated');

-- Público pode criar pedidos e clientes (checkout)
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "public_insert_customers" ON customers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "public_update_customers" ON customers FOR UPDATE USING (TRUE);

-- ════════════════════════════════════════════
-- STORAGE POLICIES (imagens dos produtos)
-- ════════════════════════════════════════════

-- Leitura pública das imagens
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Upload apenas para autenticados
DROP POLICY IF EXISTS "auth_upload_product_images" ON storage.objects;
CREATE POLICY "auth_upload_product_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Update apenas para autenticados
DROP POLICY IF EXISTS "auth_update_product_images" ON storage.objects;
CREATE POLICY "auth_update_product_images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Delete apenas para autenticados
DROP POLICY IF EXISTS "auth_delete_product_images" ON storage.objects;
CREATE POLICY "auth_delete_product_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- ════════════════════════════════════════════
-- ÍNDICES (performance)
-- ════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
