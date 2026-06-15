import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Already logged in → redirect to admin
  if (!authLoading && user) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Preencha todos os campos.'); return }
    setError('')
    setLoading(true)

    const { error: authError } = await signIn(email, password)

    setLoading(false)
    if (authError) {
      if (authError.message.includes('Invalid login')) {
        setError('Email ou senha incorretos.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada.')
      } else {
        setError(authError.message)
      }
      return
    }

    navigate('/admin')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>⚡</div>
          <h1 className={styles.title}>Painel Admin</h1>
          <p className={styles.subtitle}>Entre com suas credenciais de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && (
            <div className={styles.error} role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@suaLoja.com"
              required
              autoFocus
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Senha</label>
            <div className={styles.passWrap}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePass}
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.btn}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <span className={styles.spinner}>⏳ Entrando...</span>
            ) : 'Entrar'}
          </button>
        </form>

        <p className={styles.backLink}>
          <a href="/">← Voltar à loja</a>
        </p>
      </div>
    </div>
  )
}
