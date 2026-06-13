import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { STORE_CONFIG } from "../../config/storeConfig";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Início",       to: "/" },
  { label: "Camisetas",    to: "/categoria/camisetas" },
  { label: "Calças",       to: "/categoria/calcas" },
  { label: "Tênis",        to: "/categoria/tenis" },
  { label: "Acessórios",   to: "/categoria/acessorios" },
  { label: "Relógios",     to: "/categoria/relogios" },
  { label: "Eletrônicos",  to: "/categoria/eletronicos" },
];

export default function Header() {
  const { totalItens, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/busca?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            {STORE_CONFIG.nomeLoja}
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav} aria-label="Menu principal">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`${styles.navLink} ${location.pathname === l.to ? styles.active : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className={styles.searchInput}
                />
                <button type="button" className={styles.iconBtn} onClick={() => setSearchOpen(false)}>
                  ✕
                </button>
              </form>
            ) : (
              <button
                className={styles.iconBtn}
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir busca"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            )}

            {/* Cart */}
            <button
              className={styles.cartBtn}
              onClick={() => setIsOpen(true)}
              aria-label={`Carrinho — ${totalItens} itens`}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItens > 0 && (
                <span className={styles.cartBadge} key={totalItens}>
                  {totalItens > 99 ? "99+" : totalItens}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.open : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu mobile"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="overlay" onClick={() => setMobileOpen(false)} />
          <nav className={styles.mobileMenu}>
            <div className={styles.mobileHeader}>
              <span className={styles.logo}>
                <span className={styles.logoIcon}>◈</span>
                {STORE_CONFIG.nomeLoja}
              </span>
              <button onClick={() => setMobileOpen(false)} className={styles.iconBtn}>✕</button>
            </div>
            <form onSubmit={handleSearch} className={styles.mobileSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className={styles.searchInput}
              />
              <button type="submit" className={`btn btn-primary btn-sm`}>Buscar</button>
            </form>
            <ul className={styles.mobileLinks}>
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`${styles.mobileLink} ${location.pathname === l.to ? styles.active : ""}`}
                  >
                    {l.label}
                    <span className={styles.mobileArrow}>›</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className={styles.mobileFoot}>
              <p>{STORE_CONFIG.instagram}</p>
              <p>{STORE_CONFIG.telefone}</p>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
