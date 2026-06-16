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
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const diffX = useRef(0);

  const go = useCallback((idx) => {
    if (!imageList.length) return;
    setCurrent((idx + imageList.length) % imageList.length);
  }, [imageList.length]);

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? current + 1 : current - 1);
  };
  const onMouseDown = (e) => { setDragging(true); startX.current = e.clientX; diffX.current = 0; };
  const onMouseMove = (e) => { if (dragging) diffX.current = startX.current - e.clientX; };
  const onMouseUp = () => {
    if (dragging && Math.abs(diffX.current) > 40) go(diffX.current > 0 ? current + 1 : current - 1);
    setDragging(false);
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
      onMouseLeave={() => setDragging(false)}
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {imageList.map((src, i) => (
          // CRÍTICO: cada imagem precisa de flex: 0 0 100% para ocupar 100% do carousel
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
          <button className={`${styles.arrow} ${styles.prev}`} onClick={(e) => { e.stopPropagation(); go(current - 1); }} aria-label="Imagem anterior">‹</button>
          <button className={`${styles.arrow} ${styles.next}`} onClick={(e) => { e.stopPropagation(); go(current + 1); }} aria-label="Próxima imagem">›</button>
          <div className={styles.dots}>
            {imageList.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.active : ""}`}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                aria-label={`Ir para imagem ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}