import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import VariantModal from "../../components/VariantModal/VariantModal";
import { ProductGridSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { supabase } from "../../lib/supabase";
import styles from "./Search.module.css";

const adapt = (p) => ({
  ...p,
  nome: p.name ?? "",
  preco: p.price ?? 0,
  precoDe: p.price_from ?? null,
  descricao: p.description ?? "",
  tamanhos: Array.isArray(p.sizes) ? p.sizes : [],
  cores: Array.isArray(p.colors) ? p.colors : [],
  imagens: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
});

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("status", "ativo")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%`)
      .then(({ data, error }) => {
        if (error) console.warn("Search error:", error.message);
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>
            {q ? `Resultados para "${q}"` : "Busca"}
          </h1>
          {!loading && q && (
            <p className={styles.count}>
              {results.length} produto{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : !q ? (
          <p className={styles.empty}>Digite algo para buscar.</p>
        ) : results.length === 0 ? (
          <div className={styles.noResults}>
            <p>Nenhum produto encontrado para "{q}".</p>
            <Link to="/" className="btn btn-primary">Ver todos os produtos</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map(p => (
              <ProductCard
                key={p.id}
                product={adapt(p)}
                onAddToCart={(prod) => setModal({ product: prod, mode: "cart" })}
                onBuyNow={(prod) => setModal({ product: prod, mode: "buy" })}
              />
            ))}
          </div>
        )}
      </div>
      {modal && <VariantModal product={modal.product} mode={modal.mode} onClose={() => setModal(null)} />}
    </div>
  );
}
