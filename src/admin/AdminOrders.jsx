import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { supabase } from '../lib/supabase'
import styles from './AdminOrders.module.css'

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: '#f59e0b' },
  { value: 'separacao', label: 'Em separação', color: '#3b82f6' },
  { value: 'enviado', label: 'Enviado', color: '#8b5cf6' },
  { value: 'entregue', label: 'Entregue', color: '#10b981' },
  { value: 'cancelado', label: 'Cancelado', color: '#ef4444' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('todos')

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    loadOrders()
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
  }

  const getStatus = (val) => STATUS_OPTIONS.find(s => s.value === val) || { label: val, color: '#94a3b8' }

  const filtered = filterStatus === 'todos' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <AdminLayout>
      <div className={styles.page}>
        <h1 className={styles.title}>Pedidos</h1>

        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${filterStatus === 'todos' ? styles.active : ''}`} onClick={() => setFilterStatus('todos')}>
            Todos ({orders.length})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              className={`${styles.filterBtn} ${filterStatus === s.value ? styles.active : ''}`}
              style={filterStatus === s.value ? { borderColor: s.color, color: s.color } : {}}
              onClick={() => setFilterStatus(s.value)}
            >
              {s.label} ({orders.filter(o => o.status === s.value).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando pedidos...</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const st = getStatus(order.status)
                  return (
                    <tr key={order.id}>
                      <td className={styles.cell} style={{ color: '#475569' }}>#{order.id.toString().slice(-4)}</td>
                      <td className={styles.cell} style={{ color: '#e2e8f0', fontWeight: 500 }}>{order.customer_name}</td>
                      <td className={styles.cell}>{order.phone}</td>
                      <td className={styles.cell}>{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className={styles.cell} style={{ color: '#10b981', fontWeight: 600 }}>
                        R$ {Number(order.total || 0).toFixed(2).replace('.', ',')}
                      </td>
                      <td className={styles.cell}>
                        <select
                          className={styles.statusSelect}
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          style={{ color: st.color }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className={styles.cell}>
                        <button className={styles.viewBtn} onClick={() => setSelected(order)}>Ver</button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className={styles.empty}>Nenhum pedido encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Pedido #{selected.id.toString().slice(-4)}</h2>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.infoLabel}>Cliente</div>
                  <div className={styles.infoValue}>{selected.customer_name}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Telefone</div>
                  <div className={styles.infoValue}>{selected.phone}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>CEP</div>
                  <div className={styles.infoValue}>{selected.zipcode || '—'}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Endereço</div>
                  <div className={styles.infoValue}>{selected.address ? `${selected.address}, ${selected.number} ${selected.complement || ''}` : 'Retirada na loja'}</div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Itens do pedido</div>
                {(selected.items || []).map((item, i) => (
                  <div key={i} className={styles.item}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDetails}>
                      {item.size && <span>Tam: {item.size}</span>}
                      {item.color && <span>Cor: {item.color}</span>}
                      <span>Qtd: {item.qty}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        R$ {Number(item.price * item.qty || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.total}>
                Total: <strong>R$ {Number(selected.total || 0).toFixed(2).replace('.', ',')}</strong>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Atualizar status</div>
                <div className={styles.statusBtns}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      className={`${styles.statusOptionBtn} ${selected.status === s.value ? styles.statusActive : ''}`}
                      style={selected.status === s.value ? { background: s.color + '22', color: s.color, borderColor: s.color } : {}}
                      onClick={() => updateStatus(selected.id, s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
