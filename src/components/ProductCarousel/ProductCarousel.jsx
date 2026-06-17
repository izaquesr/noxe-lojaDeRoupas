import { useState, useRef, useCallback } from "react";
import styles from "./ProductCarousel.module.css";

export default function ProductCarousel({ images, alt = "" }) {
  // Normaliza: aceita array, string única ou null/undefined
  const imageList = Array.isArray(images)
    ? images.filter(url => typeof url === "string" && url.startsWith("http"))
    : typeof images === "string" && images.startsWith("http")
      ? [images]
      : [];

  const [current, setCurrent] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const diffX = useRef(0);

  const go = useCallback((idx) => {
    if (!imageList.length) return;
    setCurrent((idx + imageList.length) % imageList.length);
  }, [imageList.length]);

  // Bloqueia propagação para o <Link> pai ao interagir com o carrossel
  const stopLink = (e) => { e.preventDefault(); e.stopPropagation(); };

  const onTouchStart = (e) => { e.stopPropagation(); startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    e.stopPropagation();
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? current + 1 : current - 1);
  };

  const onMouseDown = (e) => {
    // Só ativa drag se há mais de uma imagem
    if (imageList.length <= 1) return;
    e.stopPropagation();
    dragging.current = true;
    startX.current = e.clientX;
    diffX.current = 0;
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    e.stopPropagation();
    diffX.current = startX.current - e.clientX;
  };
  const onMouseUp = (e) => {
    if (!dragging.current) return;
    e.stopPropagation();
    if (Math.abs(diffX.current) > 40) {
      e.preventDefault(); // impede o Link de navegar após drag
      go(diffX.current > 0 ? current + 1 : current - 1);
    }
    dragging.current = false;
  };
  const onMouseLeave = (e) => {
    if (dragging.current) { e.stopPropagation(); dragging.current = false; }
  };

  // Clique simples na imagem: só navega se não foi um drag
  const onCarouselClick = (e) => {
    if (Math.abs(diffX.current) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
    diffX.current = 0;
  };

  // Placeholder quando não há imagens
  if (!imageList.length) {
    return (
      <div className={styles.placeholder}>
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity="0.3">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={styles.carousel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onClick={onCarouselClick}
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {imageList.map((src, i) => (
          <div key={i} className={styles.slide}>
            <img
              src={src}
              alt={`${alt} — foto ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.classList.add(styles.imgError);
              }}
            />
          </div>
        ))}
      </div>

      {imageList.length > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.prev}`}
            onClick={(e) => { stopLink(e); go(current - 1); }}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Imagem anterior"
          >‹</button>
          <button
            className={`${styles.arrow} ${styles.next}`}
            onClick={(e) => { stopLink(e); go(current + 1); }}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Próxima imagem"
          >›</button>
          <div className={styles.dots}>
            {imageList.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.active : ""}`}
                onClick={(e) => { stopLink(e); setCurrent(i); }}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={`Ir para imagem ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
