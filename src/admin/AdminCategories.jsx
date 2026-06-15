import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { supabase } from '../lib/supabase'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import { toast } from '../components/Toast/Toast'
import styles from './AdminCategories.module.css'

const EMPTY = { name: '', slug: '', emoji: '', description: '' }

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) toast('Erro ao carregar categorias', 'error')
    setCategories(data || [])
    setLoading(false)
  }

  function openCreate() {
    setForm(EMPTY)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(cat) {
    setForm({ name: cat.name || '', slug: cat.slug || '', emoji: cat.emoji || '', description: cat.description || '' })
    setEditId(cat.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast('Nome é obrigatório', 'error'); return }
    if (!form.slug.trim()) { toast('Slug é obrigatório', 'error'); return }
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      emoji: form.emoji.trim() || null,
      description: form.description.trim() || null,
    }

    let error
    if (editId) {
      ;({ error } = await supabase.from('categories').update(payload).eq('id', editId))
    } else {
      ;({ error } = await supabase.from('categories').insert(payload))
    }

    setSaving(false)
    if (error) {
      if (error.message.includes('unique')) {
        toast('Slug já existe. Use outro.', 'error')
      } else {
        toast('Erro: ' + error.message, 'error')
      }
      return
    }
    toast(editId ? 'Categoria atualizada!' : 'Categoria criada!', 'success')
    setShowForm(false)
    loadData()
  }

  function askDelete(id, name) {
    setConfirm({ open: true, id, name })
  }

  async function handleDelete() {
    const { id } = confirm
    setConfirm({ open: false, id: null, name: '' })
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast('Erro ao excluir: ' + error.message, 'error'); return }
    toast('Categoria excluída', 'success')
    loadData()
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: editId ? f.slug : slugify(name) }))
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Categorias</h1>
          <button className={styles.btnPrimary} onClick={openCreate}>+ Nova categoria</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando categorias...</div>
        ) : (
          <div className={styles.grid}>
            {categories.map(cat => (
              <div key={cat.id} className={styles.card}>
                <div className={styles.cardEmoji}>{cat.emoji || '📁'}</div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>{cat.name}</div>
                  <div className={styles.cardSlug}>/{cat.slug}</div>
                  {cat.description && <div className={styles.cardDesc}>{cat.description}</div>}
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(cat)}>✏️</button>
                  <button className={styles.deleteBtn} onClick={() => askDelete(cat.id, cat.name)}>🗑️</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className={styles.empty}>
                <span>🏷️</span>
                <p>Nenhuma categoria cadastrada ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Editar categoria' : 'Nova categoria'}</h2>
              <button onClick={() => setShowForm(false)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Nome *</label>
                <input className={styles.input} value={form.name} onChange={handleNameChange} placeholder="Ex: Camisetas" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Slug (URL) *</label>
                <div className={styles.slugRow}>
                  <span className={styles.slugPrefix}>/categoria/</span>
                  <input className={styles.input} value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} placeholder="camisetas" />
                </div>
                <small style={{color:'#475569'}}>Gerado automaticamente. Use apenas letras, números e hífens.</small>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Emoji</label>
                  <input className={styles.input} value={form.emoji} onChange={e => setForm(f => ({...f, emoji: e.target.value}))} placeholder="👕" maxLength={4} />
                </div>
                <div className={styles.field} style={{flex:3}}>
                  <label className={styles.label}>Descrição</label>
                  <input className={styles.input} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Descrição curta da categoria" />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : (editId ? 'Atualizar' : 'Criar categoria')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Excluir categoria"
        message={`Excluir "${confirm.name}"? Os produtos desta categoria não serão excluídos, apenas perderão a categoria.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        danger={true}
      />
    </AdminLayout>
  )
}
