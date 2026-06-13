import { useState, useRef, useCallback } from "react";
import styles from "./ProductCarousel.module.css";

export default function ProductCarousel({ images = [], alt = "" }) {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const diffX = useRef(0);

  const go = useCallback(
    (idx) => {
      const next = (idx + images.length) % images.length;
      setCurrent(next);
    },
    [images.length]
  );

  // Touch handlers
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? current + 1 : current - 1);
  };

  // Mouse drag handlers
  const onMouseDown = (e) => {
    setDragging(true);
    startX.current = e.clientX;
    diffX.current = 0;
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    diffX.current = startX.current - e.clientX;
  };
  const onMouseUp = () => {
    if (dragging && Math.abs(diffX.current) > 40) {
      go(diffX.current > 0 ? current + 1 : current - 1);
    }
    setDragging(false);
  };

  if (!images.length) return null;

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
      {/* Images */}
      <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
        {images.map((src, i) => (
          <div key={i} className={styles.slide}>
            <img
              src={src}
              alt={`${alt} — foto ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Arrows (desktop) */}
      {images.length > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.prev}`}
            onClick={(e) => { e.stopPropagation(); go(current - 1); }}
            aria-label="Imagem anterior"
          >
            ‹
          </button>
          <button
            className={`${styles.arrow} ${styles.next}`}
            onClick={(e) => { e.stopPropagation(); go(current + 1); }}
            aria-label="Próxima imagem"
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.active : ""}`}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              aria-label={`Ir para imagem ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
