import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero/Hero";
import ProductCard from "../../components/ProductCard/ProductCard";
import VariantModal from "../../components/VariantModal/VariantModal";
import { ProductGridSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { products, getDestaques, getNovidades } from "../../data/products";
import { categoryLabel } from "../../utils/helpers";
import styles from "./Home.module.css";

const CATEGORIES = [
  { slug: "camisetas",   label: "Camisetas",   emoji: "👕" },
  { slug: "calcas",      label: "Calças",      emoji: "👖" },
  { slug: "tenis",       label: "Tênis",       emoji: "👟" },
  { slug: "jaquetas",    label: "Jaquetas",    emoji: "🧥" },
  { slug: "acessorios",  label: "Acessórios",  emoji: "🎒" },
  { slug: "relogios",    label: "Relógios",    emoji: "⌚" },
  { slug: "eletronicos", label: "Eletrônicos", emoji: "🎧" },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { product, mode }
  const revealRefs = useRef([]);

  // Simula carregamento
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Scroll reveal
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

  const openModal = (product, mode) => setModal({ product, mode });
  const closeModal = () => setModal(null);

  const destaques = getDestaques().slice(0, 8);
  const novidades = getNovidades().slice(0, 4);

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <Hero />

      {/* Categories strip */}
      <section className={styles.categoriesSection} ref={addRef}>
        <div className="container">
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to={`/categoria/${c.slug}`} className={styles.catCard}>
                <span className={styles.catEmoji}>{c.emoji}</span>
                <span className={styles.catLabel}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className={styles.section} id="destaques" ref={addRef}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Destaques</h2>
              <p className="section-subtitle">Os produtos mais amados da loja</p>
            </div>
            <Link to="/categoria/camisetas" className="section-link">Ver tudo →</Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className={styles.grid}>
              {destaques.map((p, i) => (
                <div key={p.id} className={styles.gridItem} style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard
                    product={p}
                    onAddToCart={(prod) => openModal(prod, "cart")}
                    onBuyNow={(prod) => openModal(prod, "buy")}
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
              <span className={styles.bannerEye}>Lançamento</span>
              <h2 className={styles.bannerTitle}>Frete grátis<br />em pedidos acima de R$&nbsp;299</h2>
              <p className={styles.bannerSub}>Para todo o Brasil. Entregamos em até 7 dias úteis.</p>
            </div>
            <Link to="/categoria/camisetas" className="btn btn-primary btn-lg">
              Aproveitar agora
            </Link>
          </div>
        </div>
      </section>

      {/* Novidades */}
      {novidades.length > 0 && (
        <section className={styles.section} ref={addRef}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Novidades</h2>
                <p className="section-subtitle">Recém chegados na loja</p>
              </div>
            </div>
            <div className={styles.grid}>
              {novidades.map((p, i) => (
                <div key={p.id} className={styles.gridItem} style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard
                    product={p}
                    onAddToCart={(prod) => openModal(prod, "cart")}
                    onBuyNow={(prod) => openModal(prod, "buy")}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      {modal && (
        <VariantModal
          product={modal.product}
          mode={modal.mode}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
