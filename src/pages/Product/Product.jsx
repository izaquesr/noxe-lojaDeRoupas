import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import VariantModal from "../../components/VariantModal/VariantModal";
import ProductCard from "../../components/ProductCard/ProductCard";
import { formatCurrency } from "../../utils/helpers";
import styles from "./Product.module.css";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    const { data: p } = await supabase.from("products").select("*, categories(name,slug)").eq("id", id).single();
    if (p) {
      setProduct(p);
      setActiveImg(0);
      const { data: rel } = await supabase.from("products").select("*").eq("category_id", p.category_id).eq("status","ativo").neq("id", p.id).limit(4);
      setRelated(rel || []);
    }
    setLoading(false);
  }

  if (loading) return <div className="page-wrapper"><div className="container" style={{paddingTop:80,textAlign:"center"}}>Carregando...</div></div>;

  if (!product) return (
    <div className="page-wrapper">
      <div className={`container ${styles.notFound}`}>
        <h2>Produto não encontrado</h2>
        <Link to="/" className="btn btn-primary">Voltar ao início</Link>
      </div>
    </div>
  );

  const adapt = (p) => ({
    ...p, nome: p.name, preco: p.price, precoDe: p.price_from,
    descricao: p.description, tamanhos: p.sizes || [],
    cores: p.colors || [], imagens: p.images || [],
  });

  const p = adapt(product);
  const discount = p.precoDe ? Math.round(((p.precoDe - p.preco) / p.precoDe) * 100) : null;

  return (
    <div className="page-wrapper">
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link>
          <span>›</span>
          {product.categories && <><Link to={`/categoria/${product.categories.slug}`}>{product.categories.name}</Link><span>›</span></>}
          <span>{p.nome}</span>
        </nav>

        <div className={styles.layout}>
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              <img src={p.imagens?.[activeImg] || p.imagens?.[0]} alt={p.nome} loading="eager" />
              {discount && <span className={`badge badge-sale ${styles.badge}`}>-{discount}%</span>}
            </div>
            {p.imagens?.length > 1 && (
              <div className={styles.thumbs}>
                {p.imagens.map((src, i) => (
                  <button key={i} className={`${styles.thumb} ${i === activeImg ? styles.active : ""}`} onClick={() => setActiveImg(i)}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            {product.categories && <p className={styles.cat}>{product.categories.name}</p>}
            <h1 className={styles.nome}>{p.nome}</h1>

            <div className={styles.pricing}>
              {p.precoDe && <span className={styles.priceDe}>{formatCurrency(p.precoDe)}</span>}
              <span className={styles.price}>{formatCurrency(p.preco)}</span>
            </div>

            {p.descricao && <p className={styles.desc}>{p.descricao}</p>}

            {product.brand && <p className={styles.brand}>Marca: <strong>{product.brand}</strong></p>}

            <div className={styles.actions}>
              <button className="btn btn-primary" onClick={() => setModal({ product: p, mode: "buy" })}>
                Comprar agora
              </button>
              <button className="btn btn-outline" onClick={() => setModal({ product: p, mode: "cart" })}>
                Adicionar ao carrinho
              </button>
            </div>

            {(product.mercadolivre_url || product.shopee_url) && (
              <div className={styles.marketplaces}>
                {product.mercadolivre_url && (
                  <a href={product.mercadolivre_url} target="_blank" rel="noopener noreferrer" className={`${styles.mpBtn} ${styles.ml}`}>
                    🟡 Comprar no Mercado Livre
                  </a>
                )}
                {product.shopee_url && (
                  <a href={product.shopee_url} target="_blank" rel="noopener noreferrer" className={`${styles.mpBtn} ${styles.shopee}`}>
                    🟠 Comprar na Shopee
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className="section-title">Produtos relacionados</h2>
            <div className={styles.relatedGrid}>
              {related.map(r => (
                <ProductCard
                  key={r.id}
                  product={adapt(r)}
                  onAddToCart={(prod) => setModal({ product: prod, mode: "cart" })}
                  onBuyNow={(prod) => setModal({ product: prod, mode: "buy" })}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {modal && <VariantModal product={modal.product} mode={modal.mode} onClose={() => setModal(null)} />}
    </div>
  );
}
