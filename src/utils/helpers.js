/**
 * Formata valor em reais
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/**
 * Retorna label legível da categoria
 */
export const categoryLabel = (cat) => {
  const map = {
    camisetas: "Camisetas",
    calcas: "Calças",
    tenis: "Tênis",
    sapatos: "Sapatos",
    jaquetas: "Jaquetas",
    moletons: "Moletons",
    relogios: "Relógios",
    acessorios: "Acessórios",
    eletronicos: "Eletrônicos",
  };
  return map[cat] ?? cat;
};

/**
 * Determina se o produto tem tamanhos (e quais)
 */
export const hasSizes = (product) =>
  Array.isArray(product.tamanhos) && product.tamanhos.length > 0;

/**
 * Gera string de avaliação com estrelas
 */
export const starsString = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
};

/**
 * Encurta texto longo
 */
export const truncate = (str, n = 80) =>
  str?.length > n ? str.slice(0, n) + "…" : str ?? "";

/**
 * Slug seguro para URL
 */
export const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
