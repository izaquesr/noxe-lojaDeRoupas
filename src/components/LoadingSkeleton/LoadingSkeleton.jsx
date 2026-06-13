import styles from "./LoadingSkeleton.module.css";

export function ProductCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={`${styles.box} ${styles.image}`} />
      <div className={styles.info}>
        <div className={`${styles.box} ${styles.line} ${styles.short}`} />
        <div className={`${styles.box} ${styles.line} ${styles.medium}`} />
        <div className={`${styles.box} ${styles.line} ${styles.short}`} />
        <div className={`${styles.box} ${styles.line} ${styles.price}`} />
        <div className={styles.btns}>
          <div className={`${styles.box} ${styles.btn}`} />
          <div className={`${styles.box} ${styles.btn}`} />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
