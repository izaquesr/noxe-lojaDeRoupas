import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItem from "../CartItem/CartItem";
import { formatCurrency } from "../../utils/helpers";
import { STORE_CONFIG } from "../../config/storeConfig";
import styles from "./Cart.module.css";

export default function Cart() {
  const { items, isOpen, setIsOpen, total, totalItens, clearCart } = useCart();

  // Fechar com Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setIsOpen]);

  // Bloqueia scroll quando aberto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const faltaFrete = STORE_CONFIG.freteGratisAcima - total;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <aside
        className={`${styles.cart} ${isOpen ? styles.open : ""}`}
        aria-label="Carrinho de compras"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className={styles.head}>
          <h2 className={styles.title}>
            Carrinho
            {totalItens > 0 && (
              <span className={styles.count}>{totalItens}</span>
            )}
          </h2>
          <div className={styles.headActions}>
            {items.length > 0 && (
              <button
                className={`btn btn-ghost btn-sm`}
                onClick={() => { if (confirm("Limpar carrinho?")) clearCart(); }}
              >
                Limpar
              </button>
            )}
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Fechar carrinho"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Frete grátis progress */}
        {total > 0 && faltaFrete > 0 && (
          <div className={styles.freightBar}>
            <p className={styles.freightMsg}>
              Falta <strong>{formatCurrency(faltaFrete)}</strong> para frete grátis
            </p>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${Math.min((total / STORE_CONFIG.freteGratisAcima) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {total >= STORE_CONFIG.freteGratisAcima && total > 0 && (
          <div className={`${styles.freightBar} ${styles.freightOk}`}>
            <p>🎉 Você ganhou frete grátis!</p>
          </div>
        )}

        {/* Items */}
        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity=".25">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p>Seu carrinho está vazio</p>
              <button className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>
                Explorar produtos
              </button>
            </div>
          ) : (
            items.map((item) => <CartItem key={item._key} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.foot}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalVal}>{formatCurrency(total)}</span>
            </div>
            <Link
              to="/checkout"
              className="btn btn-primary btn-full"
              onClick={() => setIsOpen(false)}
            >
              Finalizar Pedido
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <button
              className="btn btn-ghost btn-sm btn-full"
              onClick={() => setIsOpen(false)}
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
