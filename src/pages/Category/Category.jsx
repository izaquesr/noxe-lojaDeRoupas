import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import VariantModal from "../../components/VariantModal/VariantModal";
import { ProductGridSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { supabase } from "../../lib/supabase";
import styles from "./Category.module.css";

const adapt = (p) => ({
  ...p,
  nome: p.name ?? "",
  preco: p.price ?? 0,
  precoDe: p.price_from ?? null,
  descricao: p.description ?? "",
  tamanhos: Array.isArray(p.sizes) ? p.sizes : [],
  cores: Array.isArray(p.colors) ? p.colors : [],
  imagens: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
  categoria: p.categories?.slug ?? null,
});

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [sort, setSort] = useState("created_at");

  useEffect(() => { loadData(); }, [slug, sort]);

  async function loadData() {
    setLoading(true);
    const { data: cats, error: catErr } = await supabase
      .from("categories").select("*").eq("slug", slug).single();

    if (catErr && catErr.code !== "PGRST116") console.warn("Category error:", catErr.message);
    setCategory(cats ?? null);

    if (cats) {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "ativo")
        .eq("category_id", cats.id);

      if (sort === "price_asc") query = query.order("price", { ascending: true });
      else if (sort === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data: prods, error: prodErr } = await query;
      if (prodErr) console.warn("Products error:", prodErr.message);
      setProducts(Array.isArray(prods) ? prods : []);
    } else {
      setProducts([]);
    }
    setLoading(false);
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link>
          <span>›</span>
          <span>{category?.name || slug}</span>
        </nav>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {category?.emoji && <span className={styles.emoji}>{category.emoji}</span>}
              {category?.name || slug}
            </h1>
            {!loading && (
              <p className={styles.count}>
                {products.length} produto{products.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <select className={styles.sort} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="created_at">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhum produto nesta categoria ainda.</p>
            <Link to="/" className="btn btn-primary">Ver todos</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => (
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
