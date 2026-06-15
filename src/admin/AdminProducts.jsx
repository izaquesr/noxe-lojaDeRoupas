import { useEffect, useState, useRef, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import { supabase } from '../lib/supabase'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import { toast } from '../components/Toast/Toast'
import styles from './AdminProducts.module.css'

const SIZES_CLOTHING = ['PP','P','M','G','GG','XGG']
const SIZES_SHOES = ['35','36','37','38','39','40','41','42','43','44','45']
const COLORS = ['Preto','Branco','Azul','Vermelho','Verde','Amarelo','Cinza','Rosa','Laranja','Bege','Vinho','Marinho']

const EMPTY_FORM = {
  name: '', description: '', short_description: '', price: '', price_from: '',
  stock: '', sku: '', category_id: '', subcategory: '', brand: '', status: 'ativo',
  featured: false, images: [], sizes: [], colors: [], mercadolivre_url: '', shopee_url: '',
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_,i) => (
        <td key={i}><div style={{height:20,background:'#252840',borderRadius:4,animation:'pulse 1.5s infinite'}} /></td>
      ))}
    </tr>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadProgress, setUploadProgress] = useState(false)
  const [filter, setFilter] = useState('todos')
  const [urlInput, setUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })
  const fileInputRef = useRef()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [{ data: prods, error: e1 }, { data: cats, error: e2 }] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('id,name').order('name'),
      ])
      if (e1) console.error('Erro ao carregar produtos:', e1.message)
      if (e2) console.error('Erro ao carregar categorias:', e2.message)
      setProducts(prods || [])
      setCategories(cats || [])
    } catch(err) {
      console.error(err)
      toast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(p) {
    setForm({
      name: p.name || '',
      description: p.description || '',
      short_description: p.short_description || '',
      price: p.price || '',
      price_from: p.price_from || '',
      stock: p.stock ?? '',
      sku: p.sku || '',
      category_id: p.category_id || '',
      subcategory: p.subcategory || '',
      brand: p.brand || '',
      status: p.status || 'ativo',
      featured: p.featured || false,
      images: p.images || [],
      sizes: p.sizes || [],
      colors: p.colors || [],
      mercadolivre_url: p.mercadolivre_url || '',
      shopee_url: p.shopee_url || '',
    })
    setEditId(p.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast('Nome é obrigatório', 'error'); return }
    if (!form.price) { toast('Preço é obrigatório', 'error'); return }
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      short_description: form.short_description || null,
      price: parseFloat(String(form.price).replace(',', '.')) || 0,
      price_from: form.price_from ? parseFloat(String(form.price_from).replace(',', '.')) : null,
      stock: parseInt(form.stock) || 0,
      sku: form.sku || null,
      category_id: form.category_id || null,
      subcategory: form.subcategory || null,
      brand: form.brand || null,
      status: form.status,
      featured: form.featured,
      images: form.images,
      sizes: form.sizes,
      colors: form.colors,
      mercadolivre_url: form.mercadolivre_url || null,
      shopee_url: form.shopee_url || null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (editId) {
      ;({ error } = await supabase.from('products').update(payload).eq('id', editId))
    } else {
      ;({ error } = await supabase.from('products').insert(payload))
    }

    setSaving(false)
    if (error) {
      toast('Erro ao salvar: ' + error.message, 'error')
      return
    }
    toast(editId ? 'Produto atualizado!' : 'Produto criado!', 'success')
    setShowForm(false)
    loadData()
  }

  function askDelete(id, name) {
    setConfirm({ open: true, id, name })
  }

  async function handleDelete() {
    const { id } = confirm
    setConfirm({ open: false, id: null, name: '' })
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast('Erro ao excluir: ' + error.message, 'error'); return }
    toast('Produto excluído', 'success')
    loadData()
  }

  async function handleToggleStatus(p) {
    const newStatus = p.status === 'ativo' ? 'inativo' : 'ativo'
    const { error } = await supabase.from('products').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', p.id)
    if (error) { toast('Erro ao atualizar status', 'error'); return }
    toast(`Produto ${newStatus === 'ativo' ? 'ativado' : 'desativado'}`, 'success')
    loadData()
  }

  async function handleDuplicate(p) {
    const { id, created_at, updated_at, categories: _c, ...rest } = p
    const copy = { ...rest, name: rest.name + ' (cópia)', status: 'inativo', updated_at: new Date().toISOString() }
    const { error } = await supabase.from('products').insert(copy)
    if (error) { toast('Erro ao duplicar', 'error'); return }
    toast('Produto duplicado!', 'success')
    loadData()
  }

  async function handleImageUpload(files) {
    if (!files || files.length === 0) return
    setUploadProgress(true)
    const urls = []
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase()
      const safeExt = ['jpg','jpeg','png','webp','gif'].includes(ext) ? ext : 'jpg'
      const filename = `produto-${Date.now()}-${Math.random().toString(36).substr(2,6)}.${safeExt}`
      const { data, error } = await supabase.storage
        .from('products')
        .upload(filename, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
          cacheControl: '3600',
        })
      if (error) {
        console.error('Upload error:', error)
        toast('Erro no upload: ' + error.message, 'error')
        continue
      }
      const { data: urlData } = supabase.storage.from('products').getPublicUrl(filename)
      if (urlData?.publicUrl) urls.push(urlData.publicUrl)
    }
    if (urls.length > 0) {
      setForm(f => ({ ...f, images: [...f.images, ...urls] }))
      toast(`${urls.length} imagem(ns) enviada(s)!`, 'success')
    }
    setUploadProgress(false)
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  function moveImage(from, to) {
    setForm(f => {
      const imgs = [...f.images]
      const [moved] = imgs.splice(from, 1)
      imgs.splice(to, 0, moved)
      return { ...f, images: imgs }
    })
  }

  const handlePaste = useCallback(async (e) => {
    if (!showForm) return
    const items = e.clipboardData?.items
    if (!items) return
    const imageFiles = []
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) await handleImageUpload(imageFiles)
  }, [showForm])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  async function handleAddUrl() {
    const url = urlInput.trim()
    if (!url || !url.startsWith('http')) {
      toast('URL inválida', 'error')
      return
    }
    setForm(f => ({ ...f, images: [...f.images, url] }))
    setUrlInput('')
    toast('Imagem adicionada!', 'success')
  }

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true) }
  function handleDragLeave() { setIsDragging(false) }
  async function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) await handleImageUpload(files)
  }

  function toggleSize(size) {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size]
    }))
  }

  function toggleColor(color) {
    setForm(f => ({
      ...f,
      colors: f.colors.includes(color) ? f.colors.filter(c => c !== color) : [...f.colors, color]
    }))
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !search || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    const matchFilter = filter === 'todos' || p.status === filter || (filter === 'destaque' && p.featured)
    return matchSearch && matchFilter
  })

  const counts = {
    todos: products.length,
    ativo: products.filter(p => p.status === 'ativo').length,
    inativo: products.filter(p => p.status === 'inativo').length,
    destaque: products.filter(p => p.featured).length,
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Produtos</h1>
          <button className={styles.btnPrimary} onClick={openCreate}>+ Novo produto</button>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder="Buscar por nome, SKU ou marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.filters}>
            {['todos','ativo','inativo','destaque'].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className={styles.filterCount}>{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_,i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.prodCell}>
                        {p.images?.[0]
                          ? <img src={p.images[0]} className={styles.thumb} alt="" loading="lazy" />
                          : <div className={styles.thumbPlaceholder}>📦</div>
                        }
                        <div>
                          <div className={styles.prodName}>{p.name}</div>
                          {p.sku && <div className={styles.prodSku}>SKU: {p.sku}</div>}
                          {p.brand && <div className={styles.prodSku}>{p.brand}</div>}
                          {p.featured && <span className={styles.featBadge}>⭐ Destaque</span>}
                        </div>
                      </div>
                    </td>
                    <td className={styles.cell}>{p.categories?.name || '—'}</td>
                    <td className={styles.cell}>
                      <div>R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</div>
                      {p.price_from && (
                        <div className={styles.priceFrom}>De: R$ {Number(p.price_from).toFixed(2).replace('.', ',')}</div>
                      )}
                    </td>
                    <td className={styles.cell}>
                      <span className={`${styles.stockBadge} ${p.stock === 0 ? styles.stockZero : p.stock < 5 ? styles.stockLow : ''}`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <button
                        className={`${styles.statusBtn} ${p.status === 'ativo' ? styles.active : styles.inactive}`}
                        onClick={() => handleToggleStatus(p)}
                        title={`Clique para ${p.status === 'ativo' ? 'desativar' : 'ativar'}`}
                      >
                        {p.status === 'ativo' ? '✓ Ativo' : '✗ Inativo'}
                      </button>
                    </td>
                    <td className={styles.cell}>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEdit(p)} title="Editar">✏️</button>
                        <button className={styles.actionBtn} onClick={() => handleDuplicate(p)} title="Duplicar">📋</button>
                        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => askDelete(p.id, p.name)} title="Excluir">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className={styles.empty}>
                      <div>
                        <div style={{fontSize:'2rem',marginBottom:8}}>📦</div>
                        {search ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado ainda.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && !loading && (
          <div className={styles.tableFooter}>
            Exibindo {filtered.length} de {products.length} produto(s)
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Editar produto' : 'Novo produto'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)} aria-label="Fechar">✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Imagens */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Imagens do produto</label>

                <div
                  className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  {uploadProgress ? (
                    <span>⏳ Enviando imagens...</span>
                  ) : (
                    <span>📁 Clique ou arraste imagens aqui <br/><small>JPG, PNG, WEBP — múltiplas imagens suportadas</small></span>
                  )}
                </div>

                <div className={styles.urlRow}>
                  <input
                    className={styles.input}
                    placeholder="Ou cole a URL de uma imagem (https://...)"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                  />
                  <button className={styles.btnSecondary} onClick={handleAddUrl} type="button">
                    Adicionar
                  </button>
                </div>

                <small className={styles.pasteHint}>💡 Dica: copie uma imagem e pressione <strong>Ctrl+V</strong> para colar direto</small>

                {form.images.length > 0 && (
                  <div className={styles.imagesGrid}>
                    {form.images.map((url, i) => (
                      <div key={i} className={styles.imgPreview}>
                        <img src={url} alt="" loading="lazy" />
                        <div className={styles.imgOverlay}>
                          {i > 0 && (
                            <button className={styles.imgMove} onClick={() => moveImage(i, i-1)} title="Mover para frente">←</button>
                          )}
                          {i < form.images.length - 1 && (
                            <button className={styles.imgMove} onClick={() => moveImage(i, i+1)} title="Mover para trás">→</button>
                          )}
                        </div>
                        <button className={styles.imgRemove} onClick={() => removeImage(i)} aria-label="Remover imagem">✕</button>
                        {i === 0 && <span className={styles.imgPrincipal}>Principal</span>}
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => handleImageUpload(Array.from(e.target.files))}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Nome do produto *</label>
                  <input className={styles.input} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Ex: Camiseta Premium Preta" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>SKU</label>
                  <input className={styles.input} value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} placeholder="Ex: CAM-001" />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Descrição curta</label>
                <input className={styles.input} value={form.short_description} onChange={e => setForm(f => ({...f, short_description: e.target.value}))} placeholder="Resumo em uma linha" />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Descrição completa</label>
                <textarea className={styles.textarea} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={4} placeholder="Descrição detalhada do produto..." />
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Preço atual *</label>
                  <input type="number" step="0.01" min="0" className={styles.input} value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="0.00" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Preço original (riscado)</label>
                  <input type="number" step="0.01" min="0" className={styles.input} value={form.price_from} onChange={e => setForm(f => ({...f, price_from: e.target.value}))} placeholder="0.00" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Estoque (unidades)</label>
                  <input type="number" min="0" className={styles.input} value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} placeholder="0" />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Categoria</label>
                  <select className={styles.select} value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))}>
                    <option value="">Selecionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Subcategoria</label>
                  <input className={styles.input} value={form.subcategory} onChange={e => setForm(f => ({...f, subcategory: e.target.value}))} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Marca</label>
                  <input className={styles.input} value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} />
                </div>
              </div>

              {/* Tamanhos */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Tamanhos — Roupas</label>
                <div className={styles.chipsWrap}>
                  {SIZES_CLOTHING.map(s => (
                    <button key={s} type="button" className={`${styles.chip} ${form.sizes.includes(s) ? styles.chipActive : ''}`} onClick={() => toggleSize(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Tamanhos — Calçados</label>
                <div className={styles.chipsWrap}>
                  {SIZES_SHOES.map(s => (
                    <button key={s} type="button" className={`${styles.chip} ${form.sizes.includes(s) ? styles.chipActive : ''}`} onClick={() => toggleSize(s)}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Cores */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Cores disponíveis</label>
                <div className={styles.chipsWrap}>
                  {COLORS.map(c => (
                    <button key={c} type="button" className={`${styles.chip} ${form.colors.includes(c) ? styles.chipActive : ''}`} onClick={() => toggleColor(c)}>{c}</button>
                  ))}
                </div>
              </div>

              {/* Marketplaces */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>🟡 Link Mercado Livre</label>
                  <input className={styles.input} placeholder="https://produto.mercadolivre.com.br/..." value={form.mercadolivre_url} onChange={e => setForm(f => ({...f, mercadolivre_url: e.target.value}))} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>🟠 Link Shopee</label>
                  <input className={styles.input} placeholder="https://shopee.com.br/..." value={form.shopee_url} onChange={e => setForm(f => ({...f, shopee_url: e.target.value}))} />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Status</label>
                  <select className={styles.select} value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                    <option value="ativo">✓ Ativo</option>
                    <option value="inativo">✗ Inativo</option>
                  </select>
                </div>
                <div className={styles.fieldGroup} style={{ justifyContent: 'flex-end', paddingTop: 28 }}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} />
                    ⭐ Produto em destaque
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)} disabled={saving}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Salvando...' : (editId ? '✓ Atualizar produto' : '+ Criar produto')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirm.open}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${confirm.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        danger={true}
      />
    </AdminLayout>
  )
}
