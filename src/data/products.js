/**
 * PRODUTOS
 * Para adicionar um novo produto, basta inserir um novo objeto neste array.
 * Não é necessário alterar nenhum componente.
 *
 * Campos obrigatórios: id, nome, categoria, preco, imagens
 * Campos opcionais: descricao, cores, tamanhos, estoque, destaque, novo, avaliacao, avaliacoes
 *
 * Categorias aceitas: camisetas | calcas | tenis | sapatos | jaquetas | moletons | relogios | acessorios | eletronicos
 *
 * Tamanhos:
 *   Roupas → ["P","M","G","GG"] ou com "XGG"
 *   Calçados → ["35","36","37","38","39","40","41","42","43","44","45"]
 *   Sem tamanho → não incluir o campo (ou deixar [])
 */

export const products = [
  // ── CAMISETAS ─────────────────────────────────────────────
  {
    id: 1,
    nome: "Camiseta Essential Black",
    categoria: "camisetas",
    preco: 89.90,
    precoDe: 129.90,
    descricao: "Algodão 100% premium, costura dupla reforçada e caimento perfeito. Ideal para o dia a dia com sofisticação discreta.",
    estoque: 50,
    destaque: true,
    novo: false,
    avaliacao: 4.8,
    avaliacoes: 312,
    imagens: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    ],
    cores: ["Preto", "Branco", "Grafite"],
    tamanhos: ["P", "M", "G", "GG"],
  },
  {
    id: 2,
    nome: "Camiseta Oversized Drop",
    categoria: "camisetas",
    preco: 109.90,
    descricao: "Corte oversized com caimento relaxado e streetwear. Tecido pesado de 280g, serigrafia em alto relevo.",
    estoque: 30,
    destaque: true,
    novo: true,
    avaliacao: 4.9,
    avaliacoes: 87,
    imagens: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    ],
    cores: ["Preto", "Areia", "Verde Militar"],
    tamanhos: ["P", "M", "G", "GG", "XGG"],
  },
  {
    id: 3,
    nome: "Camiseta Slim Branca",
    categoria: "camisetas",
    preco: 79.90,
    descricao: "Algodão penteado de alta qualidade. Corte slim elegante. Perfeita para looks casuais refinados.",
    estoque: 40,
    destaque: false,
    novo: false,
    avaliacao: 4.6,
    avaliacoes: 204,
    imagens: [
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=600&q=80",
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80",
    ],
    cores: ["Branco", "Off-White"],
    tamanhos: ["P", "M", "G", "GG"],
  },

  // ── CALÇAS ────────────────────────────────────────────────
  {
    id: 4,
    nome: "Calça Cargo Tactical",
    categoria: "calcas",
    preco: 229.90,
    precoDe: 299.90,
    descricao: "Calça cargo com múltiplos bolsos funcionais, tecido ripstop resistente e elástico na cintura. Versatilidade máxima.",
    estoque: 25,
    destaque: true,
    novo: false,
    avaliacao: 4.7,
    avaliacoes: 156,
    imagens: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
      "https://images.unsplash.com/photo-1624378441864-6eda7be84e53?w=600&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    ],
    cores: ["Preto", "Verde Militar", "Bege"],
    tamanhos: ["P", "M", "G", "GG"],
  },
  {
    id: 5,
    nome: "Calça Moletom Premium",
    categoria: "calcas",
    preco: 189.90,
    descricao: "Moletom premium com fleece interno, elástico ajustável e cadarço. Conforto absoluto para o dia a dia.",
    estoque: 35,
    destaque: false,
    novo: true,
    avaliacao: 4.8,
    avaliacoes: 92,
    imagens: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
      "https://images.unsplash.com/photo-1608228088998-57828365d486?w=600&q=80",
    ],
    cores: ["Preto", "Cinza Mescla", "Navy"],
    tamanhos: ["P", "M", "G", "GG"],
  },

  // ── TÊNIS ─────────────────────────────────────────────────
  {
    id: 6,
    nome: "Tênis Runner X1",
    categoria: "tenis",
    preco: 349.90,
    precoDe: 499.90,
    descricao: "Solado em espuma de alta resposta, cabedal em mesh respirável e design aerodinâmico. Performance para corrida e lifestyle.",
    estoque: 20,
    destaque: true,
    novo: false,
    avaliacao: 4.9,
    avaliacoes: 441,
    imagens: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",
    ],
    cores: ["Preto/Branco", "Branco/Cinza", "All Black"],
    tamanhos: ["38", "39", "40", "41", "42", "43", "44"],
  },
  {
    id: 7,
    nome: "Tênis Chunky Platform",
    categoria: "tenis",
    preco: 429.90,
    descricao: "Solado plataforma elevado, couro sintético premium e cadarços encerados. O statement piece da coleção.",
    estoque: 15,
    destaque: true,
    novo: true,
    avaliacao: 4.7,
    avaliacoes: 63,
    imagens: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
    ],
    cores: ["Branco", "Preto", "Bege"],
    tamanhos: ["37", "38", "39", "40", "41", "42"],
  },

  // ── JAQUETAS ──────────────────────────────────────────────
  {
    id: 8,
    nome: "Jaqueta Bomber Premium",
    categoria: "jaquetas",
    preco: 389.90,
    precoDe: 499.90,
    descricao: "Bomber em nylon resistente, forro em tricô nas extremidades e bolsos com zíper YKK. Acabamento de alto padrão.",
    estoque: 18,
    destaque: true,
    novo: false,
    avaliacao: 4.9,
    avaliacoes: 228,
    imagens: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80",
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80",
    ],
    cores: ["Preto", "Verde Militar", "Azul Marinho"],
    tamanhos: ["P", "M", "G", "GG"],
  },

  // ── MOLETONS ──────────────────────────────────────────────
  {
    id: 9,
    nome: "Moletom Essential Hood",
    categoria: "moletons",
    preco: 219.90,
    descricao: "Fleece 380g com capuz duplo, bolso canguru e punhos canelados. O básico que nunca sai de moda.",
    estoque: 42,
    destaque: false,
    novo: false,
    avaliacao: 4.8,
    avaliacoes: 389,
    imagens: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80",
    ],
    cores: ["Preto", "Cinza Mescla", "Branco", "Navy"],
    tamanhos: ["P", "M", "G", "GG", "XGG"],
  },

  // ── RELÓGIOS ──────────────────────────────────────────────
  {
    id: 10,
    nome: "Relógio Chrono Steel",
    categoria: "relogios",
    preco: 689.90,
    precoDe: 899.90,
    descricao: "Caixa em aço inoxidável 316L, vidro mineral antirrisco, pulseira em couro legítimo. Movimento japonês de precisão. Resistência à água 50m.",
    estoque: 12,
    destaque: true,
    novo: false,
    avaliacao: 4.9,
    avaliacoes: 174,
    imagens: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
    ],
    cores: ["Prata/Preto", "Dourado/Marrom", "All Black"],
    // sem tamanhos → campo omitido
  },
  {
    id: 11,
    nome: "Smartwatch Pro X",
    categoria: "relogios",
    preco: 799.90,
    descricao: "Display AMOLED 1.5\", GPS integrado, monitor cardíaco 24h, autonomia de 7 dias e resistência IP68.",
    estoque: 8,
    destaque: true,
    novo: true,
    avaliacao: 4.8,
    avaliacoes: 96,
    imagens: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80",
    ],
    cores: ["Preto", "Grafite", "Prata"],
  },

  // ── ACESSÓRIOS ────────────────────────────────────────────
  {
    id: 12,
    nome: "Boné Dad Hat Premium",
    categoria: "acessorios",
    preco: 89.90,
    descricao: "Aba curva, fecho em metal ajustável e bordado em relevo. Algodão lavado para visual vintage.",
    estoque: 60,
    destaque: false,
    novo: true,
    avaliacao: 4.7,
    avaliacoes: 143,
    imagens: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&q=80",
    ],
    cores: ["Preto", "Bege", "Verde Militar"],
  },
  {
    id: 13,
    nome: "Mochila Urban Pack",
    categoria: "acessorios",
    preco: 249.90,
    precoDe: 319.90,
    descricao: "Nylon resistente à água, compartimento para notebook 15\", bolso frontal organizer e alças acolchoadas.",
    estoque: 22,
    destaque: true,
    novo: false,
    avaliacao: 4.8,
    avaliacoes: 267,
    imagens: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
      "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=600&q=80",
    ],
    cores: ["Preto", "Cinza", "Azul"],
  },

  // ── ELETRÔNICOS ───────────────────────────────────────────
  {
    id: 14,
    nome: "Fone TWS Elite",
    categoria: "eletronicos",
    preco: 299.90,
    precoDe: 399.90,
    descricao: "Cancelamento ativo de ruído, driver 12mm, autonomia 32h com case, resistência IPX5 e conexão Bluetooth 5.3.",
    estoque: 30,
    destaque: true,
    novo: true,
    avaliacao: 4.9,
    avaliacoes: 512,
    imagens: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a776c7f3c5?w=600&q=80",
    ],
    cores: ["Preto", "Branco", "Navy"],
  },
  {
    id: 15,
    nome: "Caixa de Som Portable",
    categoria: "eletronicos",
    preco: 399.90,
    descricao: "40W RMS, driver duplo estéreo, LED RGB ambiente, resistência IPX7 e 24h de autonomia. Som que preenche o ambiente.",
    estoque: 17,
    destaque: false,
    novo: false,
    avaliacao: 4.7,
    avaliacoes: 198,
    imagens: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    ],
    cores: ["Preto", "Azul", "Vermelho"],
  },
];

/**
 * Helper: retorna produtos por categoria
 */
export const getByCategory = (cat) =>
  products.filter((p) => p.categoria === cat);

/**
 * Helper: retorna produtos em destaque
 */
export const getDestaques = () => products.filter((p) => p.destaque);

/**
 * Helper: retorna novidades
 */
export const getNovidades = () => products.filter((p) => p.novo);

/**
 * Helper: busca por texto
 */
export const searchProducts = (query) => {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.nome.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      (p.descricao && p.descricao.toLowerCase().includes(q))
  );
};
