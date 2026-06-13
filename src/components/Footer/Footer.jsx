import { Link } from "react-router-dom";
import { STORE_CONFIG } from "../../config/storeConfig";
import styles from "./Footer.module.css";

const CATEGORIES = [
  { label: "Camisetas",   to: "/categoria/camisetas" },
  { label: "Calças",      to: "/categoria/calcas" },
  { label: "Tênis",       to: "/categoria/tenis" },
  { label: "Jaquetas",    to: "/categoria/jaquetas" },
  { label: "Acessórios",  to: "/categoria/acessorios" },
  { label: "Relógios",    to: "/categoria/relogios" },
  { label: "Eletrônicos", to: "/categoria/eletronicos" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            {STORE_CONFIG.nomeLoja}
          </div>
          <p className={styles.tagline}>{STORE_CONFIG.slogan}</p>
          <p className={styles.address}>{STORE_CONFIG.endereco}</p>
          <div className={styles.socials}>
            <a href={`https://wa.me/${STORE_CONFIG.whatsapp}`} target="_blank" rel="noreferrer" className={styles.social} aria-label="WhatsApp">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.551 4.118 1.512 5.848L.057 23.857a.562.562 0 00.686.686l5.965-1.464A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 01-5.004-1.372l-.359-.213-3.714.912.929-3.604-.234-.371A9.788 9.788 0 012.182 12C2.182 6.574 6.574 2.182 12 2.182c5.427 0 9.818 4.392 9.818 9.818 0 5.427-4.391 9.818-9.818 9.818z"/>
              </svg>
            </a>
            <a href={`https://instagram.com/${STORE_CONFIG.instagram.replace("@","")}`} target="_blank" rel="noreferrer" className={styles.social} aria-label="Instagram">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Categorias</h4>
          <ul className={styles.links}>
            {CATEGORIES.map((c) => (
              <li key={c.to}>
                <Link to={c.to} className={styles.link}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Informações</h4>
          <ul className={styles.links}>
            <li><a className={styles.link} href="#">Sobre a Loja</a></li>
            <li><a className={styles.link} href="#">Trocas e Devoluções</a></li>
            <li><a className={styles.link} href="#">Prazo de Entrega</a></li>
            <li><a className={styles.link} href="#">Política de Privacidade</a></li>
            <li><a className={styles.link} href="#">Termos de Uso</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contato</h4>
          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.06 9.77a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              {STORE_CONFIG.telefone}
            </div>
            <div className={styles.contactItem}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {STORE_CONFIG.email}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} {STORE_CONFIG.nomeLoja}. Todos os direitos reservados.</p>
          <p>Desenvolvido com ♥</p>
        </div>
      </div>
    </footer>
  );
}
