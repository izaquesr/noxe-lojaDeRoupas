import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { supabase } from '../lib/supabase'
import styles from './AdminCustomers.module.css'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    setLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('total_spent', { ascending: false })
    setCustomers(data || [])
    setLoading(false)
  }

  const filtered = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <AdminLayout>
      <div className={styles.page}>
        <h1 className={styles.title}>Clientes</h1>

        <input
          className={styles.searchInput}
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <div className={styles.loading}>Carregando clientes...</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Total pedidos</th>
                  <th>Valor gasto</th>
                  <th>Última compra</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td className={styles.cell} style={{ color: '#e2e8f0', fontWeight: 500 }}>{c.name}</td>
                    <td className={styles.cell}>{c.phone}</td>
                    <td className={styles.cell}>{c.total_orders || 0} pedidos</td>
                    <td className={styles.cell} style={{ color: '#10b981', fontWeight: 600 }}>
                      R$ {Number(c.total_spent || 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td className={styles.cell}>
                      {c.last_order ? new Date(c.last_order).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className={styles.empty}>Nenhum cliente encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
