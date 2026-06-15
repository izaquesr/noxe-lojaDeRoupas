import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Toast, useToast } from '../components/Toast/Toast'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/admin/products', label: 'Produtos', icon: '📦' },
  { path: '/admin/orders', label: 'Pedidos', icon: '🛒' },
  { path: '/admin/customers', label: 'Clientes', icon: '👥' },
  { path: '/admin/categories', label: 'Categorias', icon: '🏷️' },
  { path: '/admin/settings', label: 'Configurações', icon: '⚙️' },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className={styles.layout}>
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>⚡ Admin</span>
          <button className={styles.closeBtn} onClick={closeSidebar} aria-label="Fechar menu">✕</button>
        </div>

        <nav className={styles.nav} aria-label="Menu administrativo">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive(item) ? styles.active : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>👤</div>
            <div>
              <div className={styles.userName}>{user?.email?.split('@')[0] || 'Admin'}</div>
              <div className={styles.userRole}>Administrador</div>
            </div>
          </div>
          <button onClick={handleSignOut} className={styles.logoutBtn}>
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <div className={styles.topbarRight}>
            <Link to="/" target="_blank" className={styles.viewStore}>
              🛍️ Ver loja
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
