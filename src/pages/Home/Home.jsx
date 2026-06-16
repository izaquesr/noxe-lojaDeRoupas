import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero/Hero";
import ProductCard from "../../components/ProductCard/ProductCard";
import VariantModal from "../../components/VariantModal/VariantModal";
import { ProductGridSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { supabase } from "../../lib/supabase";
import styles from "./Home.module.css";

// Adapter: Supabase (snake_case) → componentes (camelCase)
const adapt = (p) => ({
  ...p,
  nome: p.name ?? "",
  preco: p.price ?? 0,
  precoDe: p.price_from ?? null,
  descricao: p.description ?? "",
  categoria: p.categories?.slug ?? p.category_slug ?? null,
  tamanhos: Array.isArray(p.sizes) ? p.sizes : [],
  cores: Array.isArray(p.colors) ? p.colors : [],
  imagens: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
  destaque: p.featured ?? false,
  novo: p.is_new ?? false,
  avaliacao: p.rating ?? null,
  avaliacoes: p.reviews_count ?? null,
});

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [destaques, setDestaques] = useState([]);
  const [novidades, setNovidades] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);
  const revealRefs = useRef([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: featured, error: e1 },
        { data: recent, error: e2 },
        { data: cats, error: e3 },
      ] = await Promise.all([
        supabase.from("products").select("*").eq("status", "ativo").eq("featured", true).order("created_at", { ascending: false }),
        supabase.from("products").select("*").eq("status", "ativo").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
      ]);

      if (e1) console.warn("Destaques:", e1.message);
      if (e2) console.warn("Novidades:", e2.message);
      if (e3) console.warn("Categorias:", e3.message);

      setDestaques(Array.isArray(featured) ? featured : []);
      setNovidades(Array.isArray(recent) ? recent : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error("Home loadData error:", err);
      setError("Não foi possível carregar os produtos. Verifique a configuração do Supabase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add(styles.visible)),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const addRef = (el) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

  return (
    <div className="page-wrapper">
      <Hero />

      {error && (
        <div style={{ background: "#2a0f0f", border: "1px solid #7f1d1d", borderRadius: 8, padding: "12px 24px", margin: "24px auto", maxWidth: 800, color: "#f87171", fontSize: "0.9rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className={styles.categoriesSection} ref={addRef}>
          <div className="container">
            <div className={styles.categoriesGrid}>
              {categories.map((c) => (
                <Link key={c.id} to={`/categoria/${c.slug}`} className={styles.catCard}>
                  <span className={styles.catEmoji}>{c.emoji || "📦"}</span>
                  <span className={styles.catLabel}>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destaques */}
      <section className={styles.section} id="destaques" ref={addRef}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Destaques</h2>
              <p className="section-subtitle">Os produtos mais amados da loja</p>
            </div>
          </div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : destaques.length === 0 ? (
            <p style={{ color: "var(--texto-secundario)", textAlign: "center", padding: "40px 0" }}>
              Nenhum produto em destaque ainda.
            </p>
          ) : (
            <div className={styles.grid}>
              {destaques.map((p, i) => (
                <div key={p.id} className={styles.gridItem} style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard
                    product={adapt(p)}
                    onAddToCart={(prod) => setModal({ product: prod, mode: "cart" })}
                    onBuyNow={(prod) => setModal({ product: prod, mode: "buy" })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner CTA */}
      <section className={styles.banner} ref={addRef}>
        <div className="container">
          <div className={styles.bannerInner}>
            <div className={styles.bannerText}>
              <span className={styles.bannerEye}>Promoção</span>
              <h2 className={styles.bannerTitle}>Frete grátis<br />em pedidos acima de R$&nbsp;299</h2>
              <p className={styles.bannerSub}>Para todo o Brasil.</p>
            </div>
            {categories[0] && (
              <Link to={`/categoria/${categories[0].slug}`} className="btn btn-primary btn-lg">
                Aproveitar agora
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Novidades */}
      {!loading && novidades.length > 0 && (
        <section className={styles.section} ref={addRef}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Novidades</h2>
                <p className="section-subtitle">Recém chegados</p>
              </div>
            </div>
            <div className={styles.grid}>
              {novidades.map((p, i) => (
                <div key={p.id} className={styles.gridItem} style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard
                    product={adapt(p)}
                    onAddToCart={(prod) => setModal({ product: prod, mode: "cart" })}
                    onBuyNow={(prod) => setModal({ product: prod, mode: "buy" })}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
