import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { STORE_CONFIG } from "../../config/storeConfig";
import styles from "./Hero.module.css";

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => el.classList.add(styles.visible), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.hero} ref={ref}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.gradient} />
        <div className={styles.grid} />
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.text}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} />
            Nova Coleção 2025
          </div>
          <h1 className={styles.title}>
            A Nova Estação<br />
            <span className={styles.gradient_text}>Começa Aqui.</span>
          </h1>
          <p className={styles.subtitle}>
            {STORE_CONFIG.slogan} Peças selecionadas para quem não abre mão de estilo e qualidade.
          </p>
          <div className={styles.actions}>
            <Link to="/categoria/camisetas" className="btn btn-primary btn-lg">
              Comprar Agora
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/#destaques" className="btn btn-outline btn-lg">
              Ver Coleção
            </Link>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>+2.400</strong>
              <span>clientes</span>
            </div>
            <div className={styles.statDiv} />
            <div className={styles.stat}>
              <strong>4.9★</strong>
              <span>avaliação</span>
            </div>
            <div className={styles.statDiv} />
            <div className={styles.stat}>
              <strong>Frete</strong>
              <span>grátis acima de R$ {STORE_CONFIG.freteGratisAcima}</span>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.card1}>
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=85"
              alt="Produto destaque"
              loading="eager"
            />
            <div className={styles.cardTag}>Relógio Chrono Steel</div>
          </div>
          <div className={styles.card2}>
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85"
              alt="Tênis"
              loading="eager"
            />
          </div>
          <div className={styles.floatBadge}>
            <span>NOVO</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint}>
        <span />
      </div>
    </section>
  );
}
