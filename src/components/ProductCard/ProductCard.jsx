import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCarousel from "../ProductCarousel/ProductCarousel";
import { formatCurrency, categoryLabel } from "../../utils/helpers";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBuyNow(product);
  };

  const discount = product.price_from
    ? Math.round(((product.price_from - product.price) / product.price_from) * 100)
    : null;

  return (
    <article className={styles.card}>
      {/* Image carousel */}
      <Link
        to={`/produto/${product.id}`}
        className={styles.imageWrap}
        tabIndex={-1}
      >
        <ProductCarousel
          images={Array.isArray(product.images) ? product.images : []}
          alt={product.name}
        />

        <div className={styles.badges}>
          {product.novo && <span className="badge badge-new">Novo</span>}
          {discount && <span className="badge badge-sale">-{discount}%</span>}
        </div>
      </Link>

      {/* Info */}
      <div className={styles.info}>
        <Link to={`/produto/${product.id}`}>
          <p className={styles.category}>{categoryLabel(product.category_id)}</p>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        {/* Rating */}
        {product.avaliacao && (
          <div className={styles.rating}>
            <span className="stars">{"★".repeat(Math.floor(product.avaliacao))}{"☆".repeat(5 - Math.floor(product.avaliacao))}</span>
            <span className={styles.ratingCount}>
              {product.avaliacao.toFixed(1)} ({product.avaliacoes?.toLocaleString("pt-BR")})
            </span>
          </div>
        )}

        {/* Price */}
        <div className={styles.priceRow}>
          {product.price_from && (
            <span className={styles.price_from}>{formatCurrency(product.price_from)}</span>
          )}
          <span className={styles.price}>{formatCurrency(product.price)}</span>
        </div>

        {/* Colors */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className={styles.colorDots}>
            {product.colors.slice(0, 4).map((c, index) => (
              <span
                key={index}
                className={styles.colorDot}
                title={c}
              />
            ))}

            {product.colors.length > 4 && (
              <span className={styles.colorMore}>
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={`btn btn-primary btn-sm ${styles.buyBtn} ${added ? styles.added : ""}`}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Adicionado
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Adicionar
              </>
            )}
          </button>
          <button
            className={`btn btn-outline btn-sm ${styles.cartBtn}`}
            onClick={handleBuy}
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}