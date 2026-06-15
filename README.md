# Loja Premium - React + Vite + Supabase

## 🚀 Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env` com suas credenciais do Supabase:
```
VITE_SUPABASE_URL=https://zjbevqrgkokaudtaszfi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_2Zlvk1iMGbJzJPh_wONQOQ_HlYFyIYD
```

### 3. Configurar banco de dados
- Acesse o painel do Supabase → SQL Editor
- Execute o conteúdo do arquivo `supabase_schema.sql`
- Crie o bucket `products` em Storage → Buckets → New bucket (marcar como público)

### 4. Criar usuário admin
- Supabase → Authentication → Users → Invite user (ou Add user)
- Use o email/senha para logar em `/admin/login`

### 5. Iniciar
```bash
npm run dev
```

## 📋 Rotas

### Loja pública
- `/` — Página inicial
- `/categoria/:slug` — Produtos por categoria
- `/produto/:id` — Detalhe do produto
- `/busca?q=termo` — Busca
- `/checkout` — Finalizar pedido

### Painel admin
- `/admin/login` — Login
- `/admin` — Dashboard
- `/admin/products` — Gerenciar produtos
- `/admin/orders` — Pedidos
- `/admin/customers` — Clientes
- `/admin/categories` — Categorias
- `/admin/settings` — Configurações

## ⚙️ Configurações da loja
Edite `src/config/storeConfig.js` para personalizar nome, WhatsApp, Instagram etc.

## 🗄️ Tabelas Supabase
- `categories` — Categorias de produtos
- `products` — Produtos com imagens, variações, etc
- `orders` — Pedidos realizados
- `customers` — Clientes
- `store_settings` — Configurações globais

## 📦 Build para produção
```bash
npm run build
```
