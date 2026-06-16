import { useEffect, useState, useRef, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import { supabase } from '../lib/supabase'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import { toast } from '../components/Toast/Toast'
import styles from './AdminProducts.module.css'

// ─── Constantes ───────────────────────────────────────────────────────────────

const SIZES_CLOTHING = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
const SIZES_SHOES    = ['33','34','35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
const COLORS         = ['Preto', 'Branco', 'Azul', 'Vermelho', 'Verde', 'Amarelo', 'Cinza', 'Rosa', 'Laranja', 'Bege', 'Vinho', 'Marinho']

const EMPTY_FORM = {
  name:             '',
  description:      '',
  short_description:'',
  price:            '',
  price_from:       '',
  stock:            '',
  sku:              '',
  category_id:      '',
  subcategory:      '',
  brand:            '',
  status:           'ativo',
  featured:         false,
  images:           [],
  sizes:            [],
  colors:           [],
  mercadolivre_url: '',
  shopee_url:       '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Garante que um valor seja um array de strings HTTP válidas, sem transformação. */
function sanitizeImages(raw) {
  if (!Array.isArray(raw)) return []
  return raw.filter(url => typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')))
}

/** Monta o payload para insert/update sem tocar nas URLs. */
function buildPayload(form) {
  return {
    name:             form.name.trim(),
    description:      form.description.trim()        || null,
    short_description:form.short_description.trim()  || null,
    price:            parseFloat(String(form.price).replace(',', '.'))        || 0,
    price_from:       form.price_from ? parseFloat(String(form.price_from).replace(',', '.')) : null,
    stock:            parseInt(form.stock, 10) || 0,
    sku:              form.sku.trim()    || null,
    category_id:      form.category_id  || null,
    subcategory:      form.subcategory.trim() || null,
    brand:            form.brand.trim()  || null,
    status:           form.status,
    featured:         form.featured,
    images:           sanitizeImages(form.images),   // ← sem regex, sem replace, sem markdown
    sizes:            form.sizes,
    colors:           form.colors,
    mercadolivre_url: form.mercadolivre_url.trim() || null,
    shopee_url:       form.shopee_url.trim()       || null,
    updated_at:       new Date().toISOString(),
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i}>
          <div style={{ height: 18, background: '#252840', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('todos')
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput,   setUrlInput]   = useState('')
  const [confirm,    setConfirm]    = useState({ open: false, id: null, name: '' })

  const fileInputRef = useRef(null)

  // ── Carregar dados ──────────────────────────────────────────────────────────

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[loadProducts] erro:', error.message)
      toast('Erro ao carregar produtos: ' + error.message, 'error')
      return []
    }
    return data || []
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('[loadCategories] erro:', error.message)
      return []
    }
    return data || []
  }

  async function loadData() {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([loadProducts(), loadCategories()])

      const catsMap  = Object.fromEntries(cats.map(c => [c.id, c.name]))
      const enriched = prods.map(p => ({
        ...p,
        categoryName: catsMap[p.category_id] || null,
        images:       sanitizeImages(p.images),
      }))

      setProducts(enriched)
      setCategories(cats)
    } catch (err) {
      console.error('[loadData] exceção:', err)
      toast('Erro inesperado ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // ── CRUD ────────────────────────────────────────────────────────────────────

  async function createProduct(payload) {
    const { error } = await supabase.from('products').insert(payload)
    if (error) throw error
  }

  async function updateProduct(id, payload) {
    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) throw error
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  }

  async function duplicateProduct(product) {
    const { id, created_at, updated_at, categoryName, ...rest } = product
    const copy = {
      ...rest,
      name:       rest.name + ' (cópia)',
      status:     'inativo',
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('products').insert(copy)
    if (error) throw error
  }

  // ── Upload de imagens ───────────────────────────────────────────────────────

  async function uploadImages(files) {
    const urls   = []
    const errors = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast(`"${file.name}" não é uma imagem válida`, 'error')
        errors.push(file.name)
        continue
      }

      const ext      = file.name.split('.').pop().toLowerCase()
      const safeExt  = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
      const filename = `produto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filename, file, {
          contentType:  file.type || 'image/jpeg',
          upsert:       false,
          cacheControl: '3600',
        })

      if (uploadError) {
        console.error('[uploadImages] upload error:', uploadError)
        toast('Erro no upload de "' + file.name + '": ' + uploadError.message, 'error')
        errors.push(file.name)
        continue
      }

      // getPublicUrl é síncrono — retorna { data: { publicUrl } }
      const { data } = supabase.storage.from('products').getPublicUrl(filename)

      console.log('UPLOAD URL:', data.publicUrl)

      if (!data.publicUrl) {
        console.error('[uploadImages] publicUrl vazia para', filename)
        toast('Não foi possível obter URL de "' + file.name + '"', 'error')
        errors.push(file.name)
        continue
      }

      urls.push(data.publicUrl)  // string pura, sem qualquer transformação
    }

    return { urls, errors }
  }

  // ── Helpers de estado do form ───────────────────────────────────────────────

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleChip(field, value) {
    setForm(f => {
      const arr = f[field]
      return { ...f, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  function addImages(urls) {
    setForm(f => ({ ...f, images: [...f.images, ...urls] }))
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  function moveImage(from, direction) {
    setForm(f => {
      const imgs = [...f.images]
      const to   = from + direction
      if (to < 0 || to >= imgs.length) return f
      ;[imgs[from], imgs[to]] = [imgs[to], imgs[from]]
      return { ...f, images: imgs }
    })
  }

  // ── Abrir / fechar form ─────────────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setUrlInput('')
    setShowForm(true)
  }

  function openEdit(product) {
    setForm({
      name:             product.name              || '',
      description:      product.description       || '',
      short_description:product.short_description || '',
      price:            product.price             || '',
      price_from:       product.price_from        || '',
      stock:            product.stock             ?? '',
      sku:              product.sku               || '',
      category_id:      product.category_id       || '',
      subcategory:      product.subcategory       || '',
      brand:            product.brand             || '',
      status:           product.status            || 'ativo',
      featured:         product.featured          || false,
      images:           sanitizeImages(product.images),
      sizes:            Array.isArray(product.sizes)  ? product.sizes  : [],
      colors:           Array.isArray(product.colors) ? product.colors : [],
      mercadolivre_url: product.mercadolivre_url  || '',
      shopee_url:       product.shopee_url        || '',
    })
    setEditId(product.id)
    setUrlInput('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
    setUrlInput('')
  }

  // ── Salvar ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.name.trim()) { toast('Nome é obrigatório', 'error');  return }
    if (!form.price)       { toast('Preço é obrigatório', 'error'); return }

    setSaving(true)
    const payload = buildPayload(form)
    console.log('SALVANDO payload.images:', payload.images)

    try {
      if (editId) {
        await updateProduct(editId, payload)
        toast('Produto atualizado!', 'success')
      } else {
        await createProduct(payload)
        toast('Produto criado!', 'success')
      }
      closeForm()
      loadData()
    } catch (err) {
      console.error('[handleSave] erro:', err)
      toast('Erro ao salvar: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Excluir ─────────────────────────────────────────────────────────────────

  function askDelete(id, name) {
    setConfirm({ open: true, id, name })
  }

  async function handleDelete() {
    const { id } = confirm
    setConfirm({ open: false, id: null, name: '' })
    try {
      await deleteProduct(id)
      toast('Produto excluído', 'success')
      loadData()
    } catch (err) {
      console.error('[handleDelete] erro:', err)
      toast('Erro ao excluir: ' + err.message, 'error')
    }
  }

  // ── Toggle status ───────────────────────────────────────────────────────────

  async function handleToggleStatus(product) {
    const newStatus = product.status === 'ativo' ? 'inativo' : 'ativo'
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', product.id)

    if (error) { toast('Erro ao atualizar status', 'error'); return }
    toast(`Produto ${newStatus === 'ativo' ? 'ativado' : 'desativado'}`, 'success')
    loadData()
  }

  // ── Duplicar ────────────────────────────────────────────────────────────────

  async function handleDuplicate(product) {
    try {
      await duplicateProduct(product)
      toast('Produto duplicado!', 'success')
      loadData()
    } catch (err) {
      console.error('[handleDuplicate] erro:', err)
      toast('Erro ao duplicar: ' + err.message, 'error')
    }
  }

  // ── Upload via input / drop / paste ────────────────────────────────────────

  async function handleFilesSelected(files) {
    if (!files || files.length === 0) return
    if (fileInputRef.current) fileInputRef.current.value = ''

    setUploading(true)
    const { urls, errors } = await uploadImages(Array.from(files))

    if (urls.length > 0) {
      addImages(urls)
      toast(`${urls.length} imagem(ns) adicionada(s)!`, 'success')
    }
    if (errors.length > 0 && urls.length === 0) {
      toast('Nenhuma imagem foi enviada', 'error')
    }
    setUploading(false)
  }

  async function handleAddUrlManual() {
    const url = urlInput.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast('URL inválida — deve começar com http:// ou https://', 'error')
      return
    }
    addImages([url])
    setUrlInput('')
    toast('Imagem adicionada!', 'success')
  }

  function handleDragOver(e)  { e.preventDefault(); setIsDragging(true)  }
  function handleDragLeave()  { setIsDragging(false) }

  async function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) await handleFilesSelected(files)
  }

  const handlePaste = useCallback(async (e) => {
    if (!showForm) return
    const items      = Array.from(e.clipboardData?.items || [])
    const imageFiles = items
      .filter(item => item.type.startsWith('image/'))
      .map(item => item.getAsFile())
      .filter(Boolean)
    if (imageFiles.length > 0) await handleFilesSelected(imageFiles)
  }, [showForm])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  // ── Filtragem ───────────────────────────────────────────────────────────────

  const filtered = products.filter(p => {
    const q           = search.toLowerCase()
    const matchSearch = !search
      || p.name?.toLowerCase().includes(q)
      || p.sku?.toLowerCase().includes(q)
      || p.brand?.toLowerCase().includes(q)
    const matchFilter =
      filter === 'todos'    ||
      filter === p.status   ||
      (filter === 'destaque' && p.featured)
    return matchSearch && matchFilter
  })

  const counts = {
    todos:    products.length,
    ativo:    products.filter(p => p.status === 'ativo').length,
    inativo:  products.filter(p => p.status === 'inativo').length,
    destaque: products.filter(p => p.featured).length,
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* Cabeçalho */}
        <div className={styles.header}>
          <h1 className={styles.title}>Produtos</h1>
          <button className={styles.btnPrimary} onClick={openCreate}>+ Novo produto</button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder="Buscar por nome, SKU ou marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.filters}>
            {['todos', 'ativo', 'inativo', 'destaque'].map(f => (
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

        {/* Tabela */}
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
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : filtered.map(p => (
                    <tr key={p.id}>

                      {/* Produto */}
                      <td>
                        <div className={styles.prodCell}>
                          {p.images[0]
                            ? <img src={p.images[0]} className={styles.thumb} alt="" loading="lazy" />
                            : <div className={styles.thumbPlaceholder}>📦</div>
                          }
                          <div>
                            <div className={styles.prodName}>{p.name}</div>
                            {p.sku   && <div className={styles.prodSku}>SKU: {p.sku}</div>}
                            {p.brand && <div className={styles.prodSku}>{p.brand}</div>}
                            {p.featured && <span className={styles.featBadge}>⭐ Destaque</span>}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className={styles.cell}>{p.categoryName || '—'}</td>

                      {/* Preço */}
                      <td className={styles.cell}>
                        <div>R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</div>
                        {p.price_from && (
                          <div className={styles.priceFrom}>
                            De: R$ {Number(p.price_from).toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </td>

                      {/* Estoque */}
                      <td className={styles.cell}>
                        <span className={`${styles.stockBadge} ${p.stock === 0 ? styles.stockZero : p.stock < 5 ? styles.stockLow : ''}`}>
                          {p.stock} un.
                        </span>
                      </td>

                      {/* Status */}
                      <td className={styles.cell}>
                        <button
                          className={`${styles.statusBtn} ${p.status === 'ativo' ? styles.active : styles.inactive}`}
                          onClick={() => handleToggleStatus(p)}
                          title={`Clique para ${p.status === 'ativo' ? 'desativar' : 'ativar'}`}
                        >
                          {p.status === 'ativo' ? '✓ Ativo' : '✗ Inativo'}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className={styles.cell}>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} onClick={() => openEdit(p)} title="Editar">✏️</button>
                          <button className={styles.actionBtn} onClick={() => handleDuplicate(p)} title="Duplicar">📋</button>
                          <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => askDelete(p.id, p.name)} title="Excluir">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📦</div>
                    {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className={styles.tableFooter}>
            Exibindo {filtered.length} de {products.length} produto(s)
          </div>
        )}
      </div>

      {/* ── Modal de formulário ─────────────────────────────────────────────── */}

      {showForm && (
        <div
          className={styles.modalOverlay}
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <div className={styles.modal}>

            {/* Header */}
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Editar produto' : 'Novo produto'}</h2>
              <button className={styles.modalClose} onClick={closeForm} aria-label="Fechar">✕</button>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>

              {/* ── Imagens ──────────────────────────────────────────────── */}
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
                  {uploading
                    ? <span>⏳ Enviando imagens...</span>
                    : <span>📁 Clique ou arraste imagens aqui<br /><small>JPG, PNG, WEBP — múltiplas imagens suportadas</small></span>
                  }
                </div>

                <div className={styles.urlRow}>
                  <input
                    className={styles.input}
                    placeholder="Ou cole a URL de uma imagem (https://...)"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrlManual())}
                  />
                  <button className={styles.btnSecondary} onClick={handleAddUrlManual} type="button">
                    Adicionar
                  </button>
                </div>

                <small className={styles.pasteHint}>
                  💡 Copie uma imagem e pressione <strong>Ctrl+V</strong> para colar
                </small>

                {form.images.length > 0 && (
                  <div className={styles.imagesGrid}>
                    {form.images.map((url, i) => (
                      <div key={`img-${i}`} className={styles.imgPreview}>
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          onError={e => {
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', position: 'absolute', inset: 0, background: '#1a0a0a', color: '#ef4444', fontSize: '0.65rem', textAlign: 'center', padding: 4 }}>
                          URL inválida
                        </div>
                        <div className={styles.imgOverlay}>
                          {i > 0 && (
                            <button className={styles.imgMove} onClick={() => moveImage(i, -1)} title="Mover para frente">←</button>
                          )}
                          {i < form.images.length - 1 && (
                            <button className={styles.imgMove} onClick={() => moveImage(i, 1)} title="Mover para trás">→</button>
                          )}
                        </div>
                        <button className={styles.imgRemove} onClick={() => removeImage(i)} aria-label="Remover">✕</button>
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
                  onChange={e => handleFilesSelected(Array.from(e.target.files))}
                />
              </div>

              {/* ── Nome + SKU ────────────────────────────────────────────── */}
              <div className={styles.row}>
                <div className={styles.fieldGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Nome do produto *</label>
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    placeholder="Ex: Camiseta Premium Preta"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>SKU</label>
                  <input
                    className={styles.input}
                    value={form.sku}
                    onChange={e => setField('sku', e.target.value)}
                    placeholder="Ex: CAM-001"
                  />
                </div>
              </div>

              {/* ── Descrição curta ───────────────────────────────────────── */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Descrição curta</label>
                <input
                  className={styles.input}
                  value={form.short_description}
                  onChange={e => setField('short_description', e.target.value)}
                  placeholder="Resumo em uma linha"
                />
              </div>

              {/* ── Descrição completa ────────────────────────────────────── */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Descrição completa</label>
                <textarea
                  className={styles.textarea}
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  rows={4}
                  placeholder="Descrição detalhada do produto..."
                />
              </div>

              {/* ── Preços + Estoque ──────────────────────────────────────── */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Preço atual *</label>
                  <input
                    type="number" step="0.01" min="0"
                    className={styles.input}
                    value={form.price}
                    onChange={e => setField('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Preço original (riscado)</label>
                  <input
                    type="number" step="0.01" min="0"
                    className={styles.input}
                    value={form.price_from}
                    onChange={e => setField('price_from', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Estoque</label>
                  <input
                    type="number" min="0"
                    className={styles.input}
                    value={form.stock}
                    onChange={e => setField('stock', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* ── Categoria + Subcategoria + Marca ──────────────────────── */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Categoria</label>
                  <select
                    className={styles.select}
                    value={form.category_id}
                    onChange={e => setField('category_id', e.target.value)}
                  >
                    <option value="">Selecionar...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Subcategoria</label>
                  <input
                    className={styles.input}
                    value={form.subcategory}
                    onChange={e => setField('subcategory', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Marca</label>
                  <input
                    className={styles.input}
                    value={form.brand}
                    onChange={e => setField('brand', e.target.value)}
                  />
                </div>
              </div>

              {/* ── Tamanhos ──────────────────────────────────────────────── */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Tamanhos — Roupas</label>
                <div className={styles.chipsWrap}>
                  {SIZES_CLOTHING.map(s => (
                    <button
                      key={s} type="button"
                      className={`${styles.chip} ${form.sizes.includes(s) ? styles.chipActive : ''}`}
                      onClick={() => toggleChip('sizes', s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Tamanhos — Calçados</label>
                <div className={styles.chipsWrap}>
                  {SIZES_SHOES.map(s => (
                    <button
                      key={s} type="button"
                      className={`${styles.chip} ${form.sizes.includes(s) ? styles.chipActive : ''}`}
                      onClick={() => toggleChip('sizes', s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Cores ─────────────────────────────────────────────────── */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Cores disponíveis</label>
                <div className={styles.chipsWrap}>
                  {COLORS.map(c => (
                    <button
                      key={c} type="button"
                      className={`${styles.chip} ${form.colors.includes(c) ? styles.chipActive : ''}`}
                      onClick={() => toggleChip('colors', c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Marketplaces ──────────────────────────────────────────── */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>🟡 Link Mercado Livre</label>
                  <input
                    className={styles.input}
                    placeholder="https://produto.mercadolivre.com.br/..."
                    value={form.mercadolivre_url}
                    onChange={e => setField('mercadolivre_url', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>🟠 Link Shopee</label>
                  <input
                    className={styles.input}
                    placeholder="https://shopee.com.br/..."
                    value={form.shopee_url}
                    onChange={e => setField('shopee_url', e.target.value)}
                  />
                </div>
              </div>

              {/* ── Status + Destaque ─────────────────────────────────────── */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Status</label>
                  <select
                    className={styles.select}
                    value={form.status}
                    onChange={e => setField('status', e.target.value)}
                  >
                    <option value="ativo">✓ Ativo</option>
                    <option value="inativo">✗ Inativo</option>
                  </select>
                </div>
                <div className={styles.fieldGroup} style={{ justifyContent: 'flex-end' }}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setField('featured', e.target.checked)}
                    />
                    ⭐ Produto em destaque
                  </label>
                </div>
              </div>

            </div>{/* /modalBody */}

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeForm} disabled={saving}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || uploading}>
                {saving ? '⏳ Salvando...' : editId ? '✓ Atualizar produto' : '+ Criar produto'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Confirm delete ─────────────────────────────────────────────────── */}
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