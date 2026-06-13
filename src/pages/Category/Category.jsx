import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import VariantModal from "../../components/VariantModal/VariantModal";
import { ProductGridSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { products } from "../../data/products";
import { categoryLabel } from "../../utils/helpers";
import styles from "./Category.module.css";

const SORTS = [
  { value: "destaque",   label: "Destaques" },
  { value: "menor",      label: "Menor Preço" },
  { value: "maior",      label: "Maior Preço" },
  { value: "novo",       label: "Novidades" },
  { value: "avaliacao",  label: "Melhor Avaliação" },
];

export default function Category() {
  const { slug } = useParams();
  const [sort, setSort] = useState("destaque");
  const [modal, setModal] = useState(null);

  const list = useMemo(() => {
    let arr = products.filter((p) => p.categoria === slug);
    switch (sort) {
      case "menor":     arr = [...arr].sort((a, b) => a.preco - b.preco); break;
      case "maior":     arr = [...arr].sort((a, b) => b.preco - a.preco); break;
      case "novo":      arr = [...arr].sort((a, b) => (b.novo ? 1 : 0) - (a.novo ? 1 : 0)); break;
      case "avaliacao": arr = [...arr].sort((a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0)); break;
      default:          arr = [...arr].sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
    }
    return arr;
  }, [slug, sort]);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link>
          <span>›</span>
          <span>{categoryLabel(slug)}</span>
        </nav>

        {/* Header */}
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>{categoryLabel(slug)}</h1>
            <p className={styles.pageCount}>{list.length} produto{list.length !== 1 ? "s" : ""}</p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={styles.sortSelect}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {list.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhum produto nesta categoria ainda.</p>
            <Link to="/" className="btn btn-primary">Voltar ao início</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {list.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 50}ms` }}>
                <ProductCard
                  product={p}
                  onAddToCart={(prod) => setModal({ product: prod, mode: "cart" })}
                  onBuyNow={(prod) => setModal({ product: prod, mode: "buy" })}
                />
              </div>
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
