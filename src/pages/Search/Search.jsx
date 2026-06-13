import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import VariantModal from "../../components/VariantModal/VariantModal";
import { searchProducts } from "../../data/products";
import styles from "./Search.module.css";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const results = searchProducts(q);
  const [modal, setModal] = useState(null);

  return (
    <div className="page-wrapper">
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link> <span>›</span> <span>Busca</span>
        </nav>

        <div className={styles.head}>
          <h1 className={styles.title}>
            {results.length > 0
              ? `${results.length} resultado${results.length !== 1 ? "s" : ""} para "${q}"`
              : `Nenhum resultado para "${q}"`}
          </h1>
        </div>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <p>Tente buscar por outro termo ou explore nossas categorias.</p>
            <Link to="/" className="btn btn-primary">Ver todos os produtos</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(prod) => setModal({ product: prod, mode: "cart" })}
                onBuyNow={(prod) => setModal({ product: prod, mode: "buy" })}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <VariantModal
          product={modal.product}
          mode={modal.mode}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
