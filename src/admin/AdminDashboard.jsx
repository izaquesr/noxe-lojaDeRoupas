import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import styles from './AdminDashboard.module.css'

function StatCard({ icon, label, value, sub, color, loading }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color + '22', color }}>{icon}</div>
      <div className={styles.statInfo}>
        {loading
          ? <div className={styles.skeleton} style={{width:60, height:28}} />
          : <div className={styles.statValue}>{value}</div>
        }
        <div className={styles.statLabel}>{label}</div>
        {sub && <div className={styles.statSub}>{sub}</div>}
      </div>
    </div>
  )
}

const STATUS_LABEL = {
  pendente: 'Pendente',
  separacao: 'Em separação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR = {
  pendente: '#f59e0b',
  separacao: '#3b82f6',
  enviado: '#8b5cf6',
  entregue: '#10b981',
  cancelado: '#ef4444',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ active: 0, inactive: 0, stock: 0, lowStock: 0 })
  const [lowStock, setLowStock] = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      // Products stats
      const { data: allProducts, error: prodErr } = await supabase
        .from('products')
        .select('id, name, price, stock, status, featured, images, created_at')
        .order('created_at', { ascending: false })

      if (prodErr) throw prodErr

      const active = (allProducts || []).filter(p => p.status === 'ativo').length
      const inactive = (allProducts || []).filter(p => p.status === 'inativo').length
      const totalStock = (allProducts || []).reduce((acc, p) => acc + (p.stock || 0), 0)
      const lowStockItems = (allProducts || []).filter(p => p.stock < 10 && p.status === 'ativo').sort((a,b) => a.stock - b.stock).slice(0, 6)

      setStats({ active, inactive, stock: totalStock, lowStock: lowStockItems.length })
      setLowStock(lowStockItems)
      setRecentProducts((allProducts || []).slice(0, 4))

      // Try to load orders (may not exist yet)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id,customer_name,total,status,created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders(ordersData || [])
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <span className={styles.pageDate}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            ⚠️ Erro ao carregar dados: {error}. Verifique as tabelas no Supabase.
          </div>
        )}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard loading={loading} icon="✅" label="Produtos ativos" value={stats.active} color="#10b981" />
          <StatCard loading={loading} icon="⛔" label="Produtos inativos" value={stats.inactive} color="#6b7280" />
          <StatCard loading={loading} icon="🗃️" label="Total em estoque" value={stats.stock} sub="unidades" color="#3b82f6" />
          <StatCard loading={loading} icon="⚠️" label="Estoque baixo" value={stats.lowStock} sub="produtos" color="#f59e0b" />
        </div>

        <div className={styles.grid2}>
          {/* Low Stock */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>⚠️ Estoque baixo</h2>
              <Link to="/admin/products" className={styles.sectionLink}>Ver todos →</Link>
            </div>
            {loading ? (
              <div className={styles.skeletonList}>
                {[...Array(4)].map((_,i) => <div key={i} className={styles.skeleton} style={{height:44}} />)}
              </div>
            ) : lowStock.length === 0 ? (
              <div className={styles.emptyState}>
                <span>✅</span>
                <p>Nenhum produto com estoque baixo!</p>
              </div>
            ) : (
              <div className={styles.list}>
                {lowStock.map(p => (
                  <div key={p.id} className={styles.listRow}>
                    <div className={styles.listLeft}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className={styles.miniImg} />
                        : <div className={styles.miniImgPlaceholder}>📦</div>
                      }
                      <span className={styles.listName}>{p.name}</span>
                    </div>
                    <span className={`${styles.stockBadge} ${p.stock === 0 ? styles.stockZero : styles.stockWarn}`}>
                      {p.stock === 0 ? 'Sem estoque' : `${p.stock} un.`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🛒 Últimos pedidos</h2>
              <Link to="/admin/orders" className={styles.sectionLink}>Ver todos →</Link>
            </div>
            {loading ? (
              <div className={styles.skeletonList}>
                {[...Array(4)].map((_,i) => <div key={i} className={styles.skeleton} style={{height:44}} />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <span>📋</span>
                <p>Nenhum pedido registrado ainda.</p>
              </div>
            ) : (
              <div className={styles.list}>
                {recentOrders.map(order => (
                  <div key={order.id} className={styles.listRow}>
                    <div>
                      <div className={styles.listName}>{order.customer_name || 'Cliente'}</div>
                      <div className={styles.listSub}>{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className={styles.orderRight}>
                      <div className={styles.orderTotal}>R$ {Number(order.total || 0).toFixed(2).replace('.', ',')}</div>
                      <span className={styles.statusBadge} style={{ background: (STATUS_COLOR[order.status] || '#888') + '22', color: STATUS_COLOR[order.status] || '#888' }}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className={styles.section} style={{ marginTop: 0 }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📦 Últimos produtos cadastrados</h2>
            <Link to="/admin/products" className={styles.sectionLink}>Ver todos →</Link>
          </div>
          {loading ? (
            <div className={styles.prodGrid}>
              {[...Array(4)].map((_,i) => <div key={i} className={styles.skeleton} style={{height:140, borderRadius:10}} />)}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <span>📦</span>
              <p>Nenhum produto cadastrado ainda. <Link to="/admin/products" style={{color:'#7c6aff'}}>Criar agora →</Link></p>
            </div>
          ) : (
            <div className={styles.prodGrid}>
              {recentProducts.map(p => (
                <div key={p.id} className={styles.prodCard}>
                  <div className={styles.prodImgWrap}>
                    <img src={p.images?.[0] || ''} alt={p.name} className={styles.prodImg} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                    <div className={styles.prodImgPlaceholder} style={{display:'none'}}>📦</div>
                  </div>
                  <div className={styles.prodName}>{p.name}</div>
                  <div className={styles.prodPrice}>R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</div>
                  <div className={`${styles.prodStatus} ${p.status === 'ativo' ? styles.active : styles.inactive}`}>
                    {p.status === 'ativo' ? '✓ Ativo' : '✗ Inativo'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
