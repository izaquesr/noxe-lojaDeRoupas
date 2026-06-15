import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero/Hero";
import ProductCard from "../../components/ProductCard/ProductCard";
import VariantModal from "../../components/VariantModal/VariantModal";
import { ProductGridSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { supabase } from "../../lib/supabase";
import styles from "./Home.module.css";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [destaques, setDestaques] = useState([]);
  const [novidades, setNovidades] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: featured }, { data: recent }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").eq("status", "ativo").eq("featured", true).order("created_at", { ascending: false }).limit(8),
      supabase.from("products").select("*").eq("status", "ativo").order("created_at", { ascending: false }).limit(4),
      supabase.from("categories").select("*").order("name"),
    ]);
    setDestaques(featured || []);
    setNovidades(recent || []);
    setCategories(cats || []);
    setLoading(false);
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

  // Adapter for products from Supabase (snake_case) to components (camelCase)
  const adapt = (p) => ({
    ...p,
    nome: p.name,
    preco: p.price,
    precoDe: p.price_from,
    descricao: p.description,
    categoria: p.category_slug || p.categories?.slug,
    tamanhos: p.sizes || [],
    cores: p.colors || [],
    imagens: p.images || [],
    destaque: p.featured,
    novo: p.is_new,
    avaliacao: p.rating,
    avaliacoes: p.reviews_count,
  });

  return (
    <div className="page-wrapper">
      <Hero />

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
