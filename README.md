# NOXE Store — Loja Virtual Premium

E-commerce completo em **React + Vite** com design dark elegante e premium.

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## 📁 Estrutura

```
src/
├── components/
│   ├── Header/         — Header fixo com scroll effect + menu mobile
│   ├── Footer/         — Rodapé completo com links e redes sociais
│   ├── Hero/           — Banner principal animado
│   ├── ProductCard/    — Card de produto com carroussel de imagens
│   ├── ProductCarousel/— Carrossel com swipe e drag
│   ├── Cart/           — Sidebar carrinho animado
│   ├── CartItem/       — Item individual do carrinho
│   ├── VariantModal/   — Modal de seleção de cor/tamanho
│   └── LoadingSkeleton/— Skeleton loading
│
├── pages/
│   ├── Home/           — Página inicial com hero, destaques, novidades
│   ├── Category/       — Listagem por categoria com ordenação
│   ├── Product/        — Detalhe do produto com galeria
│   ├── Checkout/       — Formulário + resumo + envio via WhatsApp
│   └── Search/         — Resultados de busca
│
├── context/
│   └── CartContext.jsx — Estado global do carrinho (localStorage)
│
├── data/
│   └── products.js     — ⭐ CADASTRE SEUS PRODUTOS AQUI
│
├── config/
│   └── storeConfig.js  — ⭐ CONFIGURE A LOJA AQUI
│
├── hooks/
│   └── useLocalStorage.js
│
├── utils/
│   └── helpers.js
│
└── styles/
    └── globals.css     — Variáveis CSS + estilos base
```

## ⚙️ Configuração

Edite `src/config/storeConfig.js`:

```js
export const STORE_CONFIG = {
  nomeLoja: "NOXE",
  whatsapp: "5511999999999",  // número com DDI, sem símbolos
  endereco: "Av. Paulista, 1000...",
  // ...
};
```

## 🛍️ Adicionar produtos

Edite `src/data/products.js` — apenas adicione um objeto ao array:

```js
{
  id: 16,
  nome: "Meu Produto",
  categoria: "camisetas",   // camisetas | calcas | tenis | jaquetas | moletons | relogios | acessorios | eletronicos
  preco: 99.90,
  precoDe: 129.90,          // opcional — preço riscado
  descricao: "...",
  estoque: 20,
  destaque: true,
  novo: false,
  avaliacao: 4.8,
  avaliacoes: 120,
  imagens: ["url1", "url2"],
  cores: ["Preto", "Branco"],
  tamanhos: ["P", "M", "G", "GG"],  // omita para produtos sem tamanho
}
```

## 🎨 Alterar cores

Edite as variáveis em `src/styles/globals.css` (`:root`).

## 📦 Build para produção

```bash
npm run build
```

Os arquivos ficam em `dist/`.
