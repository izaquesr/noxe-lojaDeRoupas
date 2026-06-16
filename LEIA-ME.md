# 🚀 Guia de Configuração — Loja React + Supabase

## ⚠️ Problema mais comum: TELA PRETA

O erro mais comum é a chave do Supabase errada no `.env`.

### Como corrigir:

1. Acesse: **https://supabase.com/dashboard** → seu projeto
2. Vá em **Settings → API**
3. Copie o valor em **"anon public"** — começa com `eyJhbGciOiJIUzI1NiI...`
4. Abra o arquivo `.env` e substitua:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...  ← deve começar com eyJ
```

> ❌ **ERRADO:** `sb_publishable_2Zlvk1iMGbJzJPh_...`  
> ✅ **CERTO:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📦 Setup do banco de dados

1. Acesse **Supabase → SQL Editor**
2. Cole e execute o arquivo `SETUP_SUPABASE.sql`
3. Isso cria: tabelas, políticas RLS e bucket de imagens

---

## 👤 Criar usuário admin

1. Acesse **Supabase → Authentication → Users**
2. Clique em **"Add user" → "Create new user"**
3. Informe email e senha
4. Use essas credenciais para entrar em `/admin/login`

---

## 🛠️ Rodar o projeto

```bash
npm install
npm run dev
```

---

## ✅ Correções realizadas nesta versão

- **VariantModal:** produto sem cores não bloqueia mais a compra
- **AdminProducts:** classes CSS faltantes adicionadas (dropZone, urlRow, etc)
- **Toast:** sistema global de notificações corrigido (funciona no admin)
- **Checkout:** normalização de campos `nome/preco` vs `name/price` corrigida
- **Imagens:** fallback para URL inválida com mensagem de erro visual
- **Upload:** detecta bucket inexistente e exibe instruções claras
