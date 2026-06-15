import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { supabase } from '../lib/supabase'
import { toast } from '../components/Toast/Toast'
import styles from './AdminSettings.module.css'

const DEFAULT_SETTINGS = {
  store_name: '', slogan: '', whatsapp: '', instagram: '',
  address: '', mercadolivre_url: '', shopee_url: '',
  logo_url: '', banner_url: '', email: '',
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadSettings() }, [])

  async function loadSettings() {
    const { data, error } = await supabase.from('store_settings').select('*').single()
    if (data) setSettings({ ...DEFAULT_SETTINGS, ...data })
    if (error && error.code !== 'PGRST116') console.error('Settings error:', error)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...settings, updated_at: new Date().toISOString() }
    delete payload.id

    const { error } = await supabase.from('store_settings').upsert({ id: 1, ...payload }, { onConflict: 'id' })
    setSaving(false)
    if (error) {
      toast('Erro ao salvar: ' + error.message, 'error')
      return
    }
    toast('Configurações salvas com sucesso!', 'success')
  }

  const set = (key) => (e) => setSettings(s => ({ ...s, [key]: e.target.value }))

  if (loading) return (
    <AdminLayout>
      <div className={styles.loading}>Carregando configurações...</div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Configurações da loja</h1>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Salvando...' : '✓ Salvar configurações'}
          </button>
        </div>

        <div className={styles.sections}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📋 Informações gerais</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Nome da loja</label>
                <input className={styles.input} value={settings.store_name} onChange={set('store_name')} placeholder="Minha Loja" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Slogan</label>
                <input className={styles.input} value={settings.slogan} onChange={set('slogan')} placeholder="Os melhores produtos." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email de contato</label>
                <input type="email" className={styles.input} value={settings.email} onChange={set('email')} placeholder="contato@sualoja.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Endereço</label>
                <input className={styles.input} value={settings.address} onChange={set('address')} placeholder="Rua Exemplo, 123 — Cidade/UF" />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📱 Redes sociais e contato</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>WhatsApp (somente números com DDD)</label>
                <input className={styles.input} value={settings.whatsapp} onChange={set('whatsapp')} placeholder="5511999999999" />
                {settings.whatsapp && (
                  <small style={{color:'#64748b'}}>
                    Link gerado: wa.me/{settings.whatsapp}
                  </small>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Instagram</label>
                <input className={styles.input} value={settings.instagram} onChange={set('instagram')} placeholder="@suaLoja" />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🛒 Marketplaces</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>🟡 Link principal Mercado Livre</label>
                <input className={styles.input} value={settings.mercadolivre_url} onChange={set('mercadolivre_url')} placeholder="https://www.mercadolivre.com.br/lojas/..." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>🟠 Link principal Shopee</label>
                <input className={styles.input} value={settings.shopee_url} onChange={set('shopee_url')} placeholder="https://shopee.com.br/..." />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🖼️ Imagens da loja</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>URL da logo</label>
                <input className={styles.input} value={settings.logo_url} onChange={set('logo_url')} placeholder="https://..." />
                {settings.logo_url && (
                  <img src={settings.logo_url} alt="Logo preview" className={styles.logoPreview} onError={e => e.target.style.display='none'} />
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>URL do banner principal</label>
                <input className={styles.input} value={settings.banner_url} onChange={set('banner_url')} placeholder="https://..." />
              </div>
            </div>
            {settings.banner_url && (
              <div className={styles.previewWrap}>
                <img src={settings.banner_url} alt="Banner preview" className={styles.preview} onError={e => e.target.style.display='none'} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.saveBottom}>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Salvando...' : '✓ Salvar configurações'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
