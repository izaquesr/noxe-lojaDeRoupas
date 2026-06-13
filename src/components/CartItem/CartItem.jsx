import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/helpers";
import { products } from "../../data/products";
import styles from "./CartItem.module.css";

export default function CartItem({ item }) {
  const { removeItem, updateQty } = useCart();
  const product = products.find((p) => p.id === item.id);

  return (
    <div className={styles.item}>
      <img src={item.imagem} alt={item.nome} className={styles.img} loading="lazy" />

      <div className={styles.info}>
        <p className={styles.name}>{item.nome}</p>
        <div className={styles.variants}>
          {item.cor && <span className={styles.tag}>{item.cor}</span>}
          {item.tamanho && <span className={styles.tag}>{item.tamanho}</span>}
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatCurrency(item.preco)}</span>
          <span className={styles.subtotal}>
            = {formatCurrency(item.preco * item.quantidade)}
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        {/* Quantity */}
        <div className={styles.qty}>
          <button
            className={styles.qtyBtn}
            onClick={() => updateQty(item._key, item.quantidade - 1)}
            aria-label="Diminuir"
          >−</button>
          <span className={styles.qtyNum}>{item.quantidade}</span>
          <button
            className={styles.qtyBtn}
            onClick={() => updateQty(item._key, item.quantidade + 1)}
            aria-label="Aumentar"
          >+</button>
        </div>

        {/* Remove */}
        <button
          className={styles.removeBtn}
          onClick={() => removeItem(item._key)}
          aria-label="Remover item"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
