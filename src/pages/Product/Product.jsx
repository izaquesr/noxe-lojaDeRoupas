import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { products } from "../../data/products";
import VariantModal from "../../components/VariantModal/VariantModal";
import ProductCard from "../../components/ProductCard/ProductCard";
import { formatCurrency, categoryLabel, hasSizes } from "../../utils/helpers";
import styles from "./Product.module.css";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));

  const [activeImg, setActiveImg] = useState(0);
  const [modal, setModal] = useState(null);

  if (!product) {
    return (
      <div className="page-wrapper">
        <div className={`container ${styles.notFound}`}>
          <h2>Produto não encontrado</h2>
          <Link to="/" className="btn btn-primary">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter((p) => p.categoria === product.categoria && p.id !== product.id)
    .slice(0, 4);

  const discount = product.precoDe
    ? Math.round(((product.precoDe - product.preco) / product.precoDe) * 100)
    : null;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link>
          <span>›</span>
          <Link to={`/categoria/${product.categoria}`}>{categoryLabel(product.categoria)}</Link>
          <span>›</span>
          <span>{product.nome}</span>
        </nav>

        {/* Main layout */}
        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              <img
                src={product.imagens?.[activeImg] ?? product.imagens?.[0]}
                alt={product.nome}
                loading="eager"
              />
              {product.novo && <span className={`badge badge-new ${styles.badge}`}>Novo</span>}
              {discount && <span className={`badge badge-sale ${styles.badge} ${styles.badgeSale}`}>-{discount}%</span>}
            </div>
            {product.imagens?.length > 1 && (
              <div className={styles.thumbs}>
                {product.imagens.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.active : ""}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={src} alt={`Vista ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <p className={styles.cat}>{categoryLabel(product.categoria)}</p>
            <h1 className={styles.nome}>{product.nome}</h1>

            {/* Rating */}
            {product.avaliacao && (
              <div className={styles.rating}>
                <span className="stars">{"★".repeat(Math.floor(product.avaliacao))}{"☆".repeat(5 - Math.floor(product.avaliacao))}</span>
                <span className={styles.ratingNum}>{product.avaliacao.toFixed(1)}</span>
                <span className={styles.ratingCount}>({product.avaliacoes?.toLocaleString("pt-BR")} avaliações)</span>
              </div>
            )}

            {/* Price */}
            <div className={styles.priceBlock}>
              {product.precoDe && (
                <span className={styles.precoDe}>{formatCurrency(product.precoDe)}</span>
              )}
              <span className={styles.preco}>{formatCurrency(product.preco)}</span>
              {discount && (
                <span className={styles.discountTag}>{discount}% OFF</span>
              )}
            </div>

            {/* Stock */}
            <div className={styles.stock}>
              {product.estoque > 10 ? (
                <span className={styles.stockOk}>
                  <span className={styles.dot} />
                  Em estoque ({product.estoque} unidades)
                </span>
              ) : product.estoque > 0 ? (
                <span className={styles.stockLow}>
                  <span className={styles.dot} />
                  Últimas {product.estoque} unidades!
                </span>
              ) : (
                <span className={styles.stockOut}>Esgotado</span>
              )}
            </div>

            {/* Description */}
            {product.descricao && (
              <p className={styles.descricao}>{product.descricao}</p>
            )}

            {/* Colors preview */}
            {product.cores?.length > 0 && (
              <div className={styles.variantPreview}>
                <span className={styles.variantLabel}>Cores disponíveis:</span>
                <div className={styles.chips}>
                  {product.cores.map((c) => (
                    <span key={c} className="chip" style={{ cursor: "default" }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes preview */}
            {hasSizes(product) && (
              <div className={styles.variantPreview}>
                <span className={styles.variantLabel}>Tamanhos disponíveis:</span>
                <div className={styles.chips}>
                  {product.tamanhos.map((t) => (
                    <span key={t} className="chip" style={{ cursor: "default" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.divider} />

            {/* CTA Buttons */}
            <div className={styles.actions}>
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={() => setModal({ mode: "buy" })}
                disabled={product.estoque === 0}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Comprar Agora
              </button>
              <button
                className="btn btn-outline btn-full btn-lg"
                onClick={() => setModal({ mode: "cart" })}
                disabled={product.estoque === 0}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Adicionar ao Carrinho
              </button>
            </div>

            {/* Badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Compra segura
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                Entrega garantida
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                Troca fácil
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className="section-title" style={{ marginBottom: 24 }}>Você também pode gostar</h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={(prod) => setModal({ product: prod, mode: "cart", external: true })}
                  onBuyNow={(prod) => setModal({ product: prod, mode: "buy", external: true })}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Variant Modal */}
      {modal && (
        <VariantModal
          product={modal.external ? modal.product : product}
          mode={modal.mode}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
