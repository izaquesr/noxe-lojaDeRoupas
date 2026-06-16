import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { formatCurrency, hasSizes, categoryLabel } from "../../utils/helpers";
import styles from "./VariantModal.module.css";

export default function VariantModal({ product, mode = "cart", onClose, onSuccess }) {
  const { addItem, setIsOpen } = useCart();
  const [cor, setCor] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const needsSize = hasSizes(product);
  const hasCores = Array.isArray(product.cores) && product.cores.length > 0;

  const handleConfirm = () => {
    // Só exige cor se o produto tem cores cadastradas
    if (hasCores && !cor) { setError("Selecione uma cor."); return; }
    if (needsSize && !tamanho) { setError("Selecione um tamanho."); return; }

    addItem(product, hasCores ? cor : null, needsSize ? tamanho : null);

    if (mode === "buy") {
      onClose();
      setIsOpen(true);
    } else {
      setDone(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Selecionar variação">
        {/* Header */}
        <div className={styles.head}>
          <div className={styles.headInfo}>
            <img src={product.imagens?.[0]} alt={product.nome} className={styles.thumb} />
            <div>
              <p className={styles.cat}>{categoryLabel(product.categoria)}</p>
              <h3 className={styles.name}>{product.nome}</h3>
              <p className={styles.price}>{formatCurrency(product.preco)}</p>
            </div>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className={styles.body}>
          {/* Cores — só exibe se tiver cores cadastradas */}
          {hasCores && (
            <div className={styles.section}>
              <label className={styles.label}>
                Cor
                {cor && <span className={styles.selected}>{cor}</span>}
              </label>
              <div className={styles.chips}>
                {product.cores.map((c) => (
                  <button
                    key={c}
                    className={`chip ${cor === c ? "active" : ""}`}
                    onClick={() => { setCor(c); setError(""); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tamanhos */}
          {needsSize && (
            <div className={styles.section}>
              <label className={styles.label}>
                Tamanho
                {tamanho && <span className={styles.selected}>{tamanho}</span>}
              </label>
              <div className={styles.chips}>
                {product.tamanhos.map((t) => (
                  <button
                    key={t}
                    className={`chip ${tamanho === t ? "active" : ""}`}
                    onClick={() => { setTamanho(t); setError(""); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem quando produto não tem variações */}
          {!hasCores && !needsSize && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '8px 0' }}>
              Produto sem variações. Clique em confirmar para adicionar.
            </p>
          )}

          {error && (
            <p className={styles.error}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={styles.foot}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button
            className={`btn btn-primary ${styles.confirmBtn} ${done ? styles.done : ""}`}
            onClick={handleConfirm}
          >
            {done ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Adicionado!
              </>
            ) : mode === "buy" ? (
              "Comprar Agora"
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
                Adicionar ao Carrinho
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
